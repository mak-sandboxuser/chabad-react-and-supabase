import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DEFAULT_TEST_MINUTES = 10;

function isStripeTestMode() {
  return (Deno.env.get("STRIPE_SECRET_KEY") || "").startsWith("sk_test");
}

function getTestMinutes(subscription?: Stripe.Subscription | null) {
  const fromEnv = Number(Deno.env.get("AUTO_PAY_TEST_MINUTES") || 0);
  if (fromEnv > 0) return fromEnv;
  if (subscription?.metadata?.test_mode === "true") {
    const fromMeta = Number(subscription.metadata.test_minutes || DEFAULT_TEST_MINUTES);
    return fromMeta > 0 ? fromMeta : DEFAULT_TEST_MINUTES;
  }
  // Test Stripe keys → charge every 10 minutes by default
  if (isStripeTestMode()) return DEFAULT_TEST_MINUTES;
  return 0;
}

/** Store next TEST charge time on subscription metadata (cron job creates the invoice). */
async function setNextTestChargeAt(
  stripe: Stripe,
  subscriptionId: string,
  testMinutes: number,
) {
  if (!testMinutes || testMinutes <= 0) return null;
  const nextUnix = Math.floor(Date.now() / 1000) + Math.max(testMinutes, 1) * 60;
  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      next_charge_at: String(nextUnix),
    },
  });
  console.log(`[auto-pay-test] next charge in ${testMinutes}m at ${new Date(nextUnix * 1000).toISOString()}`);
  return new Date(nextUnix * 1000).toISOString();
}

async function activateTestAutoPay(
  supabase: ReturnType<typeof createClient>,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.user_id;
  if (!userId) throw new Error("Missing user_id in session metadata.");

  const testMinutes = Number(session.metadata?.test_minutes || DEFAULT_TEST_MINUTES) || DEFAULT_TEST_MINUTES;
  const amount = Number(session.metadata?.amount || (session.amount_total || 0) / 100);
  const description = session.metadata?.description || "Membership Auto-Pay";
  const planKey = session.metadata?.plan_key || "";
  const chargeDay = Math.min(new Date().getUTCDate(), 28);

  const paymentResult = await insertDashboardPayment(supabase, {
    userId,
    amount: (session.amount_total || 0) / 100,
    referenceNumber: session.id,
    paidAt: new Date().toISOString(),
    description: "Monthly Membership — First month",
    label: "Stripe",
  });

  const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["payment_intent", "customer"],
  });

  const customerId =
    typeof fullSession.customer === "string"
      ? fullSession.customer
      : fullSession.customer?.id;

  if (!customerId) throw new Error("Missing Stripe customer on checkout session.");

  const pi = fullSession.payment_intent;
  if (pi && typeof pi !== "string") {
    const paymentMethodId =
      typeof pi.payment_method === "string" ? pi.payment_method : pi.payment_method?.id;
    if (paymentMethodId) {
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });
    }
  }

  const { data: oldRows } = await supabase
    .from("recurring_contributions")
    .select("stripe_subscription_id")
    .eq("user_id", userId)
    .eq("status", "active");

  for (const row of oldRows || []) {
    if (!row.stripe_subscription_id) continue;
    try {
      await stripe.subscriptions.cancel(row.stripe_subscription_id);
    } catch {
      // Subscription may already be cancelled.
    }
  }

  await supabase
    .from("recurring_contributions")
    .update({ status: "cancelled" })
    .eq("user_id", userId)
    .eq("status", "active");

  const nextChargeUnix = Math.floor(Date.now() / 1000) + testMinutes * 60;
  const farFutureAnchor = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
  const product = await stripe.products.create({
    name: description,
    description: `TEST: auto-charge every ${testMinutes} minutes`,
  });
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{
      price_data: {
        currency: "inr",
        unit_amount: Math.round(amount * 100),
        product: product.id,
        recurring: { interval: "month" },
      },
    }],
    billing_cycle_anchor: farFutureAnchor,
    proration_behavior: "none",
    metadata: {
      user_id: userId,
      test_mode: "true",
      test_minutes: String(testMinutes),
      next_charge_at: String(nextChargeUnix),
      plan_key: planKey,
      charge_day: String(chargeDay),
      contribution_type: "monthly",
    },
  });

  const nextChargeIso = new Date(nextChargeUnix * 1000).toISOString();

  await supabase.from("recurring_contributions").insert({
    user_id: userId,
    description: `Membership Auto-Pay (TEST every ${testMinutes} min)`,
    amount,
    frequency: "monthly",
    next_charge_date: nextChargeIso.slice(0, 10),
    status: "active",
    stripe_subscription_id: subscription.id,
    charge_day_of_month: chargeDay,
  });

  await supabase
    .from("memberships")
    .update({ stripe_subscription_id: subscription.id, billing_status: "active", status: "active" })
    .eq("user_id", userId);

  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Auto-Pay Enabled",
    body: `Your first payment of ₹${amount.toLocaleString("en-IN")} is complete. TEST mode: next charge in ${testMinutes} minutes.`,
    type: "payment",
  });

  return {
    amount: paymentResult.amount || amount,
    nextCharge: nextChargeIso,
    subscriptionId: subscription.id,
    paymentRecorded: paymentResult.recorded,
    testMode: true,
    autoPay: true,
  };
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

    // If billing RPC fails (missing function / already paid), still save for dashboard.
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
    // Unique reference race: treat as already recorded.
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

  // Checkout can succeed before latest_invoice is marked paid — use session totals.
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
    throw new Error("Missing subscription information.");
  }

  const sub = await stripe.subscriptions.retrieve(subscriptionId);
  const amount = (sub.items.data[0]?.price?.unit_amount || 0) / 100;
  const testMinutes = getTestMinutes() || (sub.metadata?.test_mode === "true" ? DEFAULT_TEST_MINUTES : 0);
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
    const paymentResult = await recordSubscriptionCharge(
      supabase,
      stripe,
      userId,
      subscriptionId,
      sessionFallback,
    );
    const nextChargeIso = testMinutes > 0
      ? new Date((sub.billing_cycle_anchor || sub.current_period_end) * 1000).toISOString()
      : new Date(sub.current_period_end * 1000).toISOString();
    if (nextChargeIso) {
      await supabase
        .from("recurring_contributions")
        .update({ next_charge_date: nextChargeIso.slice(0, 10) })
        .eq("stripe_subscription_id", subscriptionId);
    }
    return {
      amount: paymentResult.amount || amount,
      nextCharge: nextChargeIso,
      subscriptionId,
      alreadyActive: true,
      paymentRecorded: paymentResult.recorded,
      testMode: testMinutes > 0,
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

  const paymentResult = await recordSubscriptionCharge(
    supabase,
    stripe,
    userId,
    subscriptionId,
    sessionFallback,
  );

  const nextChargeIso = testMinutes > 0
    ? new Date((sub.billing_cycle_anchor || sub.current_period_end) * 1000).toISOString()
    : new Date(sub.current_period_end * 1000).toISOString();
  const nextChargeDate = (nextChargeIso || new Date().toISOString()).slice(0, 10);

  if (existingRow) {
    const { error: updateError } = await supabase
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
    if (updateError) throw updateError;
  } else {
    const { error: recurringError } = await supabase.from("recurring_contributions").insert({
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
      body: testMinutes > 0
        ? `Your first payment of ₹${amount.toLocaleString("en-IN")} is complete. TEST mode: next charge in ${testMinutes} minutes.`
        : `Your first payment of ₹${amount.toLocaleString("en-IN")} is complete. Auto-pay will charge the same amount on this date each month.`,
      type: "payment",
    });
  }

  return {
    amount: paymentResult.amount || amount,
    nextCharge: nextChargeIso,
    subscriptionId,
    alreadyActive: false,
    paymentRecorded: paymentResult.recorded,
    testMode: testMinutes > 0,
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

  if (session.mode === "payment" && session.metadata?.auto_pay === "true" && session.metadata?.test_mode === "true") {
    if (!stripe) throw new Error("Stripe client required for test auto-pay setup.");
    const result = await activateTestAutoPay(supabase, stripe, session);
    return {
      alreadyRecorded: false,
      amount: result.amount,
      autoPay: true,
      nextChargeDate: result.nextCharge,
      paymentRecorded: result.paymentRecorded,
      testMode: true,
    };
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
      testMode: result.testMode || false,
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
    if (error) {
      // Still write to payments so the dashboard updates even if billing RPC fails.
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
      if (paymentError && paymentError.code !== "23505") throw paymentError;
    }
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
        paymentRecorded: result.paymentRecorded ?? true,
        testMode: result.testMode || false,
        paymentStatus: session.payment_status,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- CREATE membership Auto-Pay checkout (subscription only) ---
    const amount = Number(body.amount);
    const description = body.description || "Membership Monthly Auto-Pay";
    const notes = body.notes || "";
    const planKey = body.planKey ? String(body.planKey) : "";

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

    const testMinutes = getTestMinutes();
    const chargeDay = Math.min(new Date().getUTCDate(), 28);

    const subscriptionMetadata = {
      user_id: user.id,
      contribution_type: "monthly",
      charge_day: String(chargeDay),
      plan_key: planKey,
      test_mode: testMinutes > 0 ? "true" : "false",
      test_minutes: String(testMinutes || 0),
    };

    // TEST: one-time payment now, then create subscription with next charge in N minutes.
    // PROD: subscription checkout, first charge now, renew monthly on same date.
    if (testMinutes > 0) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{
          price_data: {
            currency: "inr",
            unit_amount: Math.round(amount * 100),
            product_data: { name: `${description} — First month` },
          },
          quantity: 1,
        }],
        payment_intent_data: {
          setup_future_usage: "off_session",
        },
        metadata: {
          user_id: user.id,
          notes,
          auto_pay: "true",
          test_mode: "true",
          test_minutes: String(testMinutes),
          contribution_type: "monthly",
          plan_key: planKey,
          amount: String(amount),
          description,
        },
        success_url: `${siteUrl}/payments?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/payments?canceled=true`,
      });

      return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "inr",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: description,
            description: `Pay now, then ₹${amount}/month on this date each month`,
          },
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      subscription_data: { metadata: subscriptionMetadata },
      metadata: {
        user_id: user.id,
        notes,
        auto_pay: "true",
        contribution_type: "monthly",
        plan_key: planKey,
        test_mode: "false",
      },
      success_url: `${siteUrl}/payments?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
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
