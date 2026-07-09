import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const AUTO_PAY_DAY = 5;

async function recordSubscriptionCharge(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  userId: string,
  subscriptionId: string,
) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["latest_invoice"],
  });

  const latestInvoice = sub.latest_invoice;
  if (!latestInvoice || typeof latestInvoice === "string") {
    return { recorded: false, amount: 0 };
  }

  if (latestInvoice.status !== "paid" || !latestInvoice.amount_paid) {
    return { recorded: false, amount: 0 };
  }

  const referenceNumber = latestInvoice.id;
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("reference_number", referenceNumber)
    .maybeSingle();

  if (existing) {
    return { recorded: true, amount: latestInvoice.amount_paid / 100 };
  }

  const amount = latestInvoice.amount_paid / 100;
  const paidAt = latestInvoice.status_transitions?.paid_at
    ? new Date(latestInvoice.status_transitions.paid_at * 1000).toISOString()
    : new Date().toISOString();

  const { data: pendingBill } = await supabase
    .from("membership_billing_records")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["pending", "overdue"])
    .order("billing_period", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (pendingBill?.id) {
    await supabase.rpc("complete_membership_payment", {
      p_billing_record_id: pendingBill.id,
      p_payment_method: "card",
      p_payment_method_label: "Stripe Auto-Pay",
      p_reference_number: referenceNumber,
      p_paid_at: paidAt,
      p_paid_amount: amount,
    });
  } else {
    await supabase.from("payments").insert({
      user_id: userId,
      amount,
      description: "Monthly Membership Auto-Pay",
      status: "paid",
      payment_method: "card",
      payment_method_label: "Stripe Auto-Pay",
      reference_number: referenceNumber,
      contribution_type: "monthly",
      paid_at: paidAt,
    });
  }

  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Payment Successful",
    body: `Your payment of ₹${amount.toLocaleString("en-IN")} was processed successfully via Stripe Auto-Pay.`,
    type: "payment",
  });

  return { recorded: true, amount };
}

async function activateAutoPay(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.user_id;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (!userId || !subscriptionId) {
    return new Response("Missing subscription information.", { status: 400 });
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const amount = (sub.items.data[0]?.price?.unit_amount || 0) / 100;
  const nextCharge = new Date(sub.current_period_end * 1000).toISOString().slice(0, 10);

  const { data: existingRow } = await supabase
    .from("recurring_contributions")
    .select("id, status")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (existingRow?.status === "active") {
    await recordSubscriptionCharge(supabase, stripe, userId, subscriptionId);
    return new Response(JSON.stringify({ received: true, alreadyActive: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const { data: oldRows } = await supabase
    .from("recurring_contributions")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .neq("stripe_subscription_id", subscriptionId);

  for (const row of oldRows || []) {
    if (!row.stripe_subscription_id) continue;
    try {
      await stripe.subscriptions.cancel(row.stripe_subscription_id);
    } catch {
      // Subscription may already be cancelled in Stripe.
    }
  }

  await supabase
    .from("recurring_contributions")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("status", "active")
    .neq("stripe_subscription_id", subscriptionId);

  if (existingRow) {
    await supabase
      .from("recurring_contributions")
      .update({
        amount,
        next_charge_date: nextCharge,
        status: "active",
        charge_day_of_month: AUTO_PAY_DAY,
      })
      .eq("id", existingRow.id);
  } else {
    await supabase.from("recurring_contributions").insert({
      user_id: userId,
      description: "Monthly Membership Auto-Pay (5th of each month)",
      amount,
      frequency: "monthly",
      next_charge_date: nextCharge,
      status: "active",
      stripe_subscription_id: subscriptionId,
      charge_day_of_month: AUTO_PAY_DAY,
    });
  }

  await supabase
    .from("memberships")
    .update({ stripe_subscription_id: subscriptionId, billing_status: "active", status: "active" })
    .eq("user_id", userId);

  if (!existingRow || existingRow.status !== "active") {
    const { data: recentNotice } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("title", "Auto-Pay Enabled")
      .gte("created_at", new Date(Date.now() - 60000).toISOString())
      .maybeSingle();

    if (!recentNotice) {
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Auto-Pay Enabled",
        body: `Your first payment of ₹${amount.toLocaleString("en-IN")} is complete. ₹${amount.toLocaleString("en-IN")} will be charged automatically on the ${AUTO_PAY_DAY}th of each month.`,
        type: "payment",
      });
    }
  }

  await recordSubscriptionCharge(supabase, stripe, userId, subscriptionId);

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function recordCompletedSession(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
  stripe: Stripe,
) {
  const userId = session.metadata?.user_id;
  const referenceNumber = session.id;

  if (!userId) {
    return new Response("Missing user_id in session metadata.", { status: 400 });
  }

  if (session.mode === "subscription") {
    return activateAutoPay(supabase, stripe, session);
  }

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("reference_number", referenceNumber)
    .maybeSingle();

  if (!existing) {
    const amount = (session.amount_total || 0) / 100;
    const billingRecordId = session.metadata?.billing_record_id;
    const contributionType = session.metadata?.contribution_type || "monthly";
    const description =
      contributionType === "monthly" ? "Monthly Contribution" : "Membership Contribution";

    if (billingRecordId) {
      await supabase.rpc("complete_membership_payment", {
        p_billing_record_id: Number(billingRecordId),
        p_payment_method: "card",
        p_payment_method_label: "Stripe",
        p_reference_number: referenceNumber,
        p_paid_at: new Date().toISOString(),
        p_paid_amount: amount,
      });
    } else {
      await supabase.from("payments").insert({
        user_id: userId,
        amount,
        description: session.metadata?.notes?.trim() || description,
        status: "paid",
        payment_method: "card",
        payment_method_label: "Stripe",
        reference_number: referenceNumber,
        contribution_type: contributionType,
        paid_at: new Date().toISOString(),
      });

      const { data: pendingContribution } = await supabase
        .from("contributions")
        .select("id")
        .eq("user_id", userId)
        .eq("status", "pending")
        .order("due_date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (pendingContribution?.id) {
        await supabase
          .from("contributions")
          .update({ status: "paid" })
          .eq("id", pendingContribution.id);
      } else {
        await supabase.from("contributions").insert({
          user_id: userId,
          amount,
          status: "paid",
          contribution_type: contributionType,
          due_date: new Date().toISOString().slice(0, 10),
        });
      }
    }

    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Payment Successful",
      body: `Your payment of ₹${amount.toLocaleString("en-IN")} was processed successfully via Stripe.`,
      type: "payment",
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function recordInvoicePaid(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  invoice: Stripe.Invoice,
) {
  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;

  if (!subscriptionId || invoice.amount_paid === 0) {
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const userId = sub.metadata?.user_id;
  if (!userId) {
    return new Response("Missing user_id on subscription.", { status: 400 });
  }

  const referenceNumber = invoice.id;
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("reference_number", referenceNumber)
    .maybeSingle();

  if (existing) {
    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const amount = (invoice.amount_paid || 0) / 100;
  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
    : new Date().toISOString();

  const { data: pendingBill } = await supabase
    .from("membership_billing_records")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["pending", "overdue"])
    .order("billing_period", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (pendingBill?.id) {
    await supabase.rpc("complete_membership_payment", {
      p_billing_record_id: pendingBill.id,
      p_payment_method: "card",
      p_payment_method_label: "Stripe Auto-Pay",
      p_reference_number: referenceNumber,
      p_paid_at: paidAt,
      p_paid_amount: amount,
    });
  } else {
    await supabase.from("payments").insert({
      user_id: userId,
      amount,
      description: "Monthly Membership Auto-Pay",
      status: "paid",
      payment_method: "card",
      payment_method_label: "Stripe Auto-Pay",
      reference_number: referenceNumber,
      contribution_type: "monthly",
      paid_at: paidAt,
    });
  }

  const nextCharge = new Date(sub.current_period_end * 1000).toISOString().slice(0, 10);
  await supabase
    .from("recurring_contributions")
    .update({ next_charge_date: nextCharge, amount, status: "active" })
    .eq("stripe_subscription_id", subscriptionId);

  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Auto-Pay Successful",
    body: `Your monthly contribution of ₹${amount.toLocaleString("en-IN")} was charged automatically.`,
    type: "payment",
  });

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleSubscriptionCancelled(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
) {
  const subscriptionId = subscription.id;
  await supabase
    .from("recurring_contributions")
    .update({ status: "cancelled" })
    .eq("stripe_subscription_id", subscriptionId);

  const userId = subscription.metadata?.user_id;
  if (userId) {
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Auto-Pay Cancelled",
      body: "Your automatic monthly payment has been cancelled. You can re-enable it from the Payments page.",
      type: "payment",
    });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceKey) {
    return new Response("Missing configuration.", { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
  const supabase = createClient(supabaseUrl, serviceKey);

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header.", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook verification failed.";
    return new Response(message, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    return await recordCompletedSession(supabase, session, stripe);
  }

  if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    return await recordInvoicePaid(supabase, stripe, invoice);
  }

  if (event.type === "customer.subscription.updated") {
  const subscription = event.data.object as Stripe.Subscription;
  return await handleSubscriptionUpdated(supabase, subscription);
}

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    return await handleSubscriptionCancelled(supabase, subscription);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function handleSubscriptionUpdated(
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
) {
  const nextCharge = new Date(
    subscription.current_period_end * 1000
  ).toISOString().slice(0, 10);

  const amount =
    (subscription.items.data[0]?.price?.unit_amount || 0) / 100;

  await supabase
    .from("recurring_contributions")
    .update({
      amount,
      next_charge_date: nextCharge,
      status: subscription.status === "active" ? "active" : "cancelled",
    })
    .eq("stripe_subscription_id", subscription.id);

  return new Response(
    JSON.stringify({ received: true }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}