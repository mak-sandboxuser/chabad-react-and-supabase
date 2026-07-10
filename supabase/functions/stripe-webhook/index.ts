import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const DEFAULT_TEST_MINUTES = 10;

function getTestMinutes(subscription?: Stripe.Subscription | null) {
  const fromEnv = Number(Deno.env.get("AUTO_PAY_TEST_MINUTES") || 0);
  if (fromEnv > 0) return fromEnv;
  if (subscription?.metadata?.test_mode === "true") {
    const fromMeta = Number(subscription.metadata.test_minutes || DEFAULT_TEST_MINUTES);
    return fromMeta > 0 ? fromMeta : DEFAULT_TEST_MINUTES;
  }
  return 0;
}

async function scheduleNextTestCharge(stripe: Stripe, subscriptionId: string, testMinutes: number) {
  if (!testMinutes || testMinutes <= 0) return null;
  const nextUnix = Math.floor(Date.now() / 1000) + testMinutes * 60;
  await stripe.subscriptions.update(subscriptionId, {
    trial_end: nextUnix,
    proration_behavior: "none",
  });
  return new Date(nextUnix * 1000).toISOString();
}

async function insertDashboardPayment(
  supabase: ReturnType<typeof createClient>,
  {
    userId,
    amount,
    referenceNumber,
    paidAt,
    description = "Monthly Membership Auto-Pay",
    label = "Stripe Auto-Pay",
  }: {
    userId: string;
    amount: number;
    referenceNumber: string;
    paidAt: string;
    description?: string;
    label?: string;
  },
) {
  if (!amount || amount <= 0 || !referenceNumber) {
    return { recorded: false, amount: 0 };
  }

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("reference_number", referenceNumber)
    .maybeSingle();

  if (existing) {
    return { recorded: true, amount };
  }

  const { data: pendingBill } = await supabase
    .from("membership_billing_records")
    .select("id")
    .eq("user_id", userId)
    .in("status", ["pending", "overdue"])
    .order("billing_period", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (pendingBill?.id) {
    const { error } = await supabase.rpc("complete_membership_payment", {
      p_billing_record_id: pendingBill.id,
      p_payment_method: "card",
      p_payment_method_label: label,
      p_reference_number: referenceNumber,
      p_paid_at: paidAt,
      p_paid_amount: amount,
    });

    if (!error) {
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Payment Successful",
        body: `Your payment of ₹${amount.toLocaleString("en-IN")} was processed successfully via Stripe Auto-Pay.`,
        type: "payment",
      });
      return { recorded: true, amount };
    }
  }

  const { error: paymentError } = await supabase.from("payments").insert({
    user_id: userId,
    amount,
    description,
    status: "paid",
    payment_method: "card",
    payment_method_label: label,
    reference_number: referenceNumber,
    contribution_type: "monthly",
    paid_at: paidAt,
  });

  if (paymentError) {
    if (paymentError.code === "23505") {
      return { recorded: true, amount };
    }
    throw paymentError;
  }

  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Payment Successful",
    body: `Your payment of ₹${amount.toLocaleString("en-IN")} was processed successfully via Stripe Auto-Pay.`,
    type: "payment",
  });

  return { recorded: true, amount };
}

async function recordSubscriptionCharge(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  userId: string,
  subscriptionId: string,
  fallback?: { amount?: number; referenceNumber?: string },
) {
  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["latest_invoice"],
  });

  let latestInvoice = sub.latest_invoice;
  if (typeof latestInvoice === "string") {
    latestInvoice = await stripe.invoices.retrieve(latestInvoice);
  }

  const invoicePaid =
    latestInvoice &&
    typeof latestInvoice !== "string" &&
    latestInvoice.status === "paid" &&
    Number(latestInvoice.amount_paid || 0) > 0;

  if (invoicePaid && typeof latestInvoice !== "string") {
    const amount = latestInvoice.amount_paid / 100;
    const paidAt = latestInvoice.status_transitions?.paid_at
      ? new Date(latestInvoice.status_transitions.paid_at * 1000).toISOString()
      : new Date().toISOString();

    return insertDashboardPayment(supabase, {
      userId,
      amount,
      referenceNumber: latestInvoice.id,
      paidAt,
    });
  }

  const fallbackAmount = Number(fallback?.amount || 0);
  const fallbackRef = fallback?.referenceNumber;
  if (fallbackAmount > 0 && fallbackRef) {
    return insertDashboardPayment(supabase, {
      userId,
      amount: fallbackAmount,
      referenceNumber: fallbackRef,
      paidAt: new Date().toISOString(),
      description: "Monthly Membership Contribution",
      label: "Stripe",
    });
  }

  return { recorded: false, amount: 0 };
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
  const testMinutes = getTestMinutes(sub);
  const chargeDay = Math.min(new Date().getUTCDate(), 28);

  const { data: existingRow } = await supabase
    .from("recurring_contributions")
    .select("id, status")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  const sessionFallback = {
    amount: (session.amount_total || 0) / 100 || amount,
    referenceNumber: session.id,
  };

  if (existingRow?.status === "active") {
    await recordSubscriptionCharge(supabase, stripe, userId, subscriptionId, sessionFallback);
    const nextChargeIso = testMinutes > 0
      ? await scheduleNextTestCharge(stripe, subscriptionId, testMinutes)
      : new Date(sub.current_period_end * 1000).toISOString();
    if (nextChargeIso) {
      await supabase
        .from("recurring_contributions")
        .update({ next_charge_date: nextChargeIso.slice(0, 10) })
        .eq("stripe_subscription_id", subscriptionId);
    }
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

  await recordSubscriptionCharge(supabase, stripe, userId, subscriptionId, sessionFallback);

  const nextChargeIso = testMinutes > 0
    ? await scheduleNextTestCharge(stripe, subscriptionId, testMinutes)
    : new Date(sub.current_period_end * 1000).toISOString();
  const nextChargeDate = (nextChargeIso || new Date().toISOString()).slice(0, 10);

  if (existingRow) {
    await supabase
      .from("recurring_contributions")
      .update({
        amount,
        next_charge_date: nextChargeDate,
        status: "active",
        charge_day_of_month: chargeDay,
        description: testMinutes > 0
          ? `Membership Auto-Pay (TEST every ${testMinutes} min)`
          : "Membership Auto-Pay (same date each month)",
      })
      .eq("id", existingRow.id);
  } else {
    await supabase.from("recurring_contributions").insert({
      user_id: userId,
      description: testMinutes > 0
        ? `Membership Auto-Pay (TEST every ${testMinutes} min)`
        : "Membership Auto-Pay (same date each month)",
      amount,
      frequency: "monthly",
      next_charge_date: nextChargeDate,
      status: "active",
      stripe_subscription_id: subscriptionId,
      charge_day_of_month: chargeDay,
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
        body: testMinutes > 0
          ? `Your first payment of ₹${amount.toLocaleString("en-IN")} is complete. TEST mode: next charge in ${testMinutes} minutes.`
          : `Your first payment of ₹${amount.toLocaleString("en-IN")} is complete. Auto-pay will charge the same amount on this date each month.`,
        type: "payment",
      });
    }
  }

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
      const { error } = await supabase.rpc("complete_membership_payment", {
        p_billing_record_id: Number(billingRecordId),
        p_payment_method: "card",
        p_payment_method_label: "Stripe",
        p_reference_number: referenceNumber,
        p_paid_at: new Date().toISOString(),
        p_paid_amount: amount,
      });
      if (error) {
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
      }
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

  await insertDashboardPayment(supabase, {
    userId,
    amount,
    referenceNumber,
    paidAt,
  });

  const testMinutes = getTestMinutes(sub);
  const nextChargeIso = testMinutes > 0
    ? await scheduleNextTestCharge(stripe, subscriptionId, testMinutes)
    : new Date(sub.current_period_end * 1000).toISOString();
  const nextCharge = (nextChargeIso || new Date().toISOString()).slice(0, 10);

  await supabase
    .from("recurring_contributions")
    .update({ next_charge_date: nextCharge, amount, status: "active" })
    .eq("stripe_subscription_id", subscriptionId);

  await supabase.from("notifications").insert({
    user_id: userId,
    title: testMinutes > 0 ? "Test Auto-Pay Successful" : "Auto-Pay Successful",
    body: testMinutes > 0
      ? `₹${amount.toLocaleString("en-IN")} charged. Next TEST charge in ${testMinutes} minutes.`
      : `Your monthly contribution of ₹${amount.toLocaleString("en-IN")} was charged automatically.`,
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