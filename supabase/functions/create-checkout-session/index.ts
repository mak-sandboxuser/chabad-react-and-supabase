import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const AUTO_PAY_DAY = 5;

function getNextAutoPayAnchor(dayOfMonth: number) {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const currentDay = now.getUTCDate();

  const anchorMonth = currentDay < dayOfMonth ? month : month + 1;
  const anchorDate = new Date(Date.UTC(year, anchorMonth, dayOfMonth, 0, 0, 0));
  return Math.floor(anchorDate.getTime() / 1000);
}

function getAnchorFromNow(minutesFromNow: number) {
  const safeMinutes = Math.max(1, Math.floor(minutesFromNow));
  return Math.floor(Date.now() / 1000) + safeMinutes * 60;
}

function resolveReturnBaseUrl(requested: unknown, fallback: string) {
  const fallbackUrl = fallback.replace(/\/$/, "");

  if (!requested || typeof requested !== "string") {
    return fallbackUrl;
  }

  try {
    const url = new URL(requested);
    if (!["http:", "https:"].includes(url.protocol)) {
      return fallbackUrl;
    }

    const origin = `${url.protocol}//${url.host}`;
    const allowedOrigins = new Set([
      fallbackUrl,
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      ...(Deno.env.get("ALLOWED_RETURN_ORIGINS") || "")
        .split(",")
        .map((item) => item.trim().replace(/\/$/, ""))
        .filter(Boolean),
    ]);

    if (allowedOrigins.has(origin)) {
      return origin;
    }

    // Allow Vercel preview/production URLs without manual secret updates.
    if (url.protocol === "https:" && url.hostname.endsWith(".vercel.app")) {
      return origin;
    }
  } catch {
    // Fall through to configured fallback URL.
  }

  return fallbackUrl;
}

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
    const { error } = await supabase.rpc("complete_membership_payment", {
      p_billing_record_id: pendingBill.id,
      p_payment_method: "card",
      p_payment_method_label: "Stripe Auto-Pay",
      p_reference_number: referenceNumber,
      p_paid_at: paidAt,
      p_paid_amount: amount,
    });
    if (error) throw error;
  } else {
    const { error: paymentError } = await supabase.from("payments").insert({
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
    if (paymentError) throw paymentError;
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
    throw new Error("Missing subscription information.");
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
    const paymentResult = await recordSubscriptionCharge(supabase, stripe, userId, subscriptionId);
    return {
      amount: paymentResult.amount || amount,
      nextCharge,
      subscriptionId,
      alreadyActive: true,
      paymentRecorded: paymentResult.recorded,
    };
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
    const { error: updateError } = await supabase
      .from("recurring_contributions")
      .update({
        amount,
        next_charge_date: nextCharge,
        status: "active",
        charge_day_of_month: AUTO_PAY_DAY,
      })
      .eq("id", existingRow.id);
    if (updateError) throw updateError;
  } else {
    const { error: recurringError } = await supabase.from("recurring_contributions").insert({
      user_id: userId,
      description: "Monthly Membership Auto-Pay (5th of each month)",
      amount,
      frequency: "monthly",
      next_charge_date: nextCharge,
      status: "active",
      stripe_subscription_id: subscriptionId,
      charge_day_of_month: AUTO_PAY_DAY,
    });
    if (recurringError) throw recurringError;
  }

  await supabase
    .from("memberships")
    .update({ stripe_subscription_id: subscriptionId, billing_status: "active", status: "active" })
    .eq("user_id", userId);

  if (!existingRow || existingRow.status !== "active") {
    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Auto-Pay Enabled",
      body: `Your monthly contribution of ₹${amount.toLocaleString("en-IN")} will be charged automatically on the ${AUTO_PAY_DAY}th of each month.`,
      type: "payment",
    });
  }

  const paymentResult = await recordSubscriptionCharge(supabase, stripe, userId, subscriptionId);

  return {
    amount: paymentResult.amount || amount,
    nextCharge,
    subscriptionId,
    alreadyActive: false,
    paymentRecorded: paymentResult.recorded,
  };
}

async function recordCompletedSession(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
  stripe?: Stripe,
) {
  const userId = session.metadata?.user_id;
  const referenceNumber = session.id;

  if (!userId) {
    throw new Error("Missing user_id in Stripe session.");
  }

  if (session.mode === "subscription") {
    if (!stripe) throw new Error("Stripe client required for subscription setup.");
    const result = await activateAutoPay(supabase, stripe, session);
    return {
      alreadyRecorded: false,
      amount: result.amount,
      autoPay: true,
      nextChargeDate: result.nextCharge,
      paymentRecorded: result.paymentRecorded,
    };
  }

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("reference_number", referenceNumber)
    .maybeSingle();

  if (existing) {
    return {
      alreadyRecorded: true,
      amount: (session.amount_total || 0) / 100,
      paymentRecorded: true,
    };
  }

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
    if (error) throw error;
  } else {
    const { error: paymentError } = await supabase.from("payments").insert({
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
    if (paymentError) throw paymentError;

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

  return { alreadyRecorded: false, amount, paymentRecorded: true };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const configuredSiteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecret || !supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Stripe or Supabase environment variables.");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const siteUrl = resolveReturnBaseUrl(body.returnBaseUrl, configuredSiteUrl);
    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });

    // --- VERIFY completed Stripe checkout ---
    if (body.action === "verify" || body.sessionId) {
      if (!serviceKey) {
        throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured for payment verification.");
      }

      const sessionId = body.sessionId;
      if (!sessionId) {
        return new Response(JSON.stringify({ error: "Missing sessionId." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.metadata?.user_id !== user.id) {
        return new Response(JSON.stringify({ error: "Payment does not belong to this user." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (session.mode === "subscription") {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;
        if (!subscriptionId) {
          return new Response(JSON.stringify({ error: "Subscription was not created." }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        if (!["active", "trialing"].includes(sub.status)) {
          return new Response(JSON.stringify({
            error: "Auto-pay setup is not complete yet.",
            paymentStatus: sub.status,
          }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else if (session.payment_status !== "paid") {
        return new Response(JSON.stringify({
          error: "Payment is not completed yet.",
          paymentStatus: session.payment_status,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabaseAdmin = createClient(supabaseUrl, serviceKey);
      const result = await recordCompletedSession(supabaseAdmin, session, stripe);

      return new Response(JSON.stringify({
        success: true,
        amount: result.amount,
        alreadyRecorded: result.alreadyRecorded,
        autoPay: result.autoPay || false,
        nextChargeDate: result.nextChargeDate || null,
        paymentRecorded: result.paymentRecorded ?? !result.autoPay,
        paymentStatus: session.payment_status,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- CREATE new Stripe checkout session ---
    const amount = Number(body.amount);
    const description = body.description || "Membership Contribution";
    const notes = body.notes || "";
    const billingRecordId = body.billingRecordId ? String(body.billingRecordId) : "";
    const autoPay = body.autoPay === true;

    if (!amount || amount < 1) {
      return new Response(JSON.stringify({ error: "Enter a valid payment amount." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = serviceKey
      ? createClient(supabaseUrl, serviceKey)
      : supabase;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id, full_name, email")
      .eq("id", user.id)
      .maybeSingle();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || profile?.email || undefined,
        name: profile?.full_name || undefined,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabaseAdmin
        .from("profiles")
        .update({ stripe_customer_id: customerId, updated_at: new Date().toISOString() })
        .eq("id", user.id);
    }

    if (autoPay) {
      const testMinutes = Number(Deno.env.get("AUTO_PAY_TEST_MINUTES") || 0);
      const subscriptionData: Record<string, unknown> = {
        metadata: {
          user_id: user.id,
          contribution_type: "monthly",
          charge_day: String(AUTO_PAY_DAY),
          test_mode: testMinutes > 0 ? "true" : "false",
        },
      };

      // Stripe requires trial_end to be at least 2 days in future.
      // For short test windows, use billing_cycle_anchor instead.
      if (testMinutes > 0) {
        subscriptionData.billing_cycle_anchor = getAnchorFromNow(testMinutes);
        subscriptionData.proration_behavior = "none";
      } else {
        subscriptionData.trial_end = getNextAutoPayAnchor(AUTO_PAY_DAY);
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "inr",
              unit_amount: Math.round(amount * 100),
              product_data: {
                name: description,
                description: testMinutes > 0
                  ? `TEST: first charge in ${testMinutes} minutes`
                  : `Charged automatically on the ${AUTO_PAY_DAY}th of every month`,
              },
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ],
        subscription_data: subscriptionData,
        metadata: {
          user_id: user.id,
          notes,
          auto_pay: "true",
          contribution_type: body.contributionType || "monthly",
        },
        success_url: `${siteUrl}/payments?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/payments?canceled=true`,
      });

      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            unit_amount: Math.round(amount * 100),
            product_data: {
              name: description,
              description: notes || undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        user_id: user.id,
        notes,
        billing_record_id: billingRecordId,
        contribution_type: body.contributionType || "monthly",
      },
      success_url: `${siteUrl}/payments?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payments?canceled=true`,
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stripe request failed.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
