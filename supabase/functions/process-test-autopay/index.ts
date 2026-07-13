import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const DEFAULT_TEST_MINUTES = 10;

function isTestSubscription(sub: Stripe.Subscription) {
  if (sub.metadata?.test_mode === "true") return true;
  const fromEnv = Number(Deno.env.get("AUTO_PAY_TEST_MINUTES") || 0);
  if (fromEnv > 0) return true;
  return (Deno.env.get("STRIPE_SECRET_KEY") || "").startsWith("sk_test");
}

function getTestMinutes(subscription: Stripe.Subscription) {
  const fromEnv = Number(Deno.env.get("AUTO_PAY_TEST_MINUTES") || 0);
  if (fromEnv > 0) return fromEnv;
  const fromMeta = Number(subscription.metadata?.test_minutes || DEFAULT_TEST_MINUTES);
  return fromMeta > 0 ? fromMeta : DEFAULT_TEST_MINUTES;
}

/** Successful charges allowed before auto-pay stops itself (default 12). */
function getMaxCharges(subscription: Stripe.Subscription) {
  const fromMeta = Number(subscription.metadata?.max_charges || 0);
  if (fromMeta > 0) return fromMeta;
  const fromEnv = Number(Deno.env.get("AUTO_PAY_MAX_CHARGES") || 12);
  return Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : 12;
}

/** Cancels the subscription and marks the recurring row cancelled once the cap is hit. */
async function stopAutoPay(
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>,
  subscriptionId: string,
  userId: string,
  totalCharges: number,
) {
  try {
    await stripe.subscriptions.cancel(subscriptionId);
  } catch {
    // May already be cancelled.
  }
  await supabase
    .from("recurring_contributions")
    .update({ status: "cancelled" })
    .eq("stripe_subscription_id", subscriptionId);
  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Auto-Pay Completed",
    body: `Auto-pay finished after ${totalCharges} payments and has been stopped automatically.`,
    type: "payment",
  });
}

function isAuthorized(req: Request) {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && req.headers.get("x-cron-secret") === cronSecret) {
    return true;
  }
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const auth = req.headers.get("Authorization");
  return Boolean(serviceKey && auth === `Bearer ${serviceKey}`);
}

async function resolvePaymentMethodId(
  stripe: Stripe,
  customerId: string,
  preferredType: "card" | "us_bank_account" = "card",
) {
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return null;

  const fromSettings = customer.invoice_settings?.default_payment_method;
  if (typeof fromSettings === "string") return fromSettings;
  if (fromSettings && typeof fromSettings !== "string") return fromSettings.id;

  // Try the preferred type first, then fall back to the other type.
  const types: Array<"card" | "us_bank_account"> =
    preferredType === "us_bank_account"
      ? ["us_bank_account", "card"]
      : ["card", "us_bank_account"];

  for (const type of types) {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type,
      limit: 1,
    });
    if (paymentMethods.data[0]?.id) return paymentMethods.data[0].id;
  }
  return null;
}

async function recordTestPayment(
  supabase: ReturnType<typeof createClient>,
  {
    userId,
    amount,
    referenceNumber,
    testMinutes,
    paymentMethod = "card",
    methodLabel = "Stripe Auto-Pay",
    currency = "inr",
    pending = false,
  }: {
    userId: string;
    amount: number;
    referenceNumber: string;
    testMinutes: number;
    paymentMethod?: string;
    methodLabel?: string;
    currency?: string;
    pending?: boolean;
  },
) {
  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("reference_number", referenceNumber)
    .maybeSingle();

  if (existing) return false;

  const money = currency === "usd"
    ? `$${amount.toLocaleString("en-US")}`
    : `₹${amount.toLocaleString("en-IN")}`;

  const paidAt = new Date().toISOString();
  const { error } = await supabase.from("payments").insert({
    user_id: userId,
    amount,
    description: "Membership Auto-Pay (TEST)",
    status: pending ? "pending" : "paid",
    payment_method: paymentMethod,
    payment_method_label: methodLabel,
    reference_number: referenceNumber,
    contribution_type: "monthly",
    paid_at: paidAt,
  });

  if (error && error.code !== "23505") throw error;

  await supabase.from("notifications").insert({
    user_id: userId,
    title: "Test Auto-Pay Successful",
    body: pending
      ? `${money} bank debit initiated. It may take a few days to clear. Next TEST charge in ${testMinutes} minutes.`
      : `${money} charged. Next TEST charge in ${testMinutes} minutes.`,
    type: "payment",
  });

  return true;
}

async function chargeDueSubscription(
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>,
  row: { stripe_subscription_id: string; user_id: string; amount: number },
  now: number,
) {
  const subscriptionId = row.stripe_subscription_id;
  const sub = await stripe.subscriptions.retrieve(subscriptionId);

  if (!isTestSubscription(sub)) {
    return { subscriptionId, skipped: true, reason: "not_test_mode" };
  }
  if (sub.status === "canceled" || sub.status === "incomplete_expired") {
    return { subscriptionId, skipped: true, reason: "inactive_subscription" };
  }

  const testMinutes = getTestMinutes(sub);
  const maxCharges = getMaxCharges(sub);
  const chargesSoFar = Number(sub.metadata?.charges_count || 0);

  // Cap reached — stop auto-pay instead of charging again.
  if (chargesSoFar >= maxCharges) {
    await stopAutoPay(stripe, supabase, subscriptionId, row.user_id, chargesSoFar);
    return { subscriptionId, skipped: true, reason: "max_charges_reached", chargesSoFar };
  }

  let nextChargeAt = Number(sub.metadata?.next_charge_at || 0);

  if (!nextChargeAt) {
    nextChargeAt = now + Math.max(testMinutes, 1) * 60;
    await stripe.subscriptions.update(subscriptionId, {
      metadata: {
        ...sub.metadata,
        test_mode: "true",
        test_minutes: String(testMinutes),
        next_charge_at: String(nextChargeAt),
      },
    });
    return {
      subscriptionId,
      skipped: true,
      reason: "backfilled_next_charge_at",
      nextChargeAt: new Date(nextChargeAt * 1000).toISOString(),
    };
  }

  if (now < nextChargeAt) {
    return {
      subscriptionId,
      skipped: true,
      reason: "not_due_yet",
      nextChargeAt: new Date(nextChargeAt * 1000).toISOString(),
    };
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) {
    return { subscriptionId, error: "Missing Stripe customer." };
  }

  const isBank = sub.metadata?.payment_method === "bank";
  const paymentMethodType = isBank ? "us_bank_account" : "card";
  const currency = (sub.metadata?.currency || (isBank ? "usd" : "inr")).toLowerCase();
  const dbMethod = isBank ? "bank" : "card";
  const methodLabel = isBank ? "Stripe Bank (ACH)" : "Stripe Auto-Pay";

  const paymentMethodId = await resolvePaymentMethodId(stripe, customerId, paymentMethodType);
  if (!paymentMethodId) {
    return { subscriptionId, error: `No saved ${dbMethod} on file for auto-pay.` };
  }

  const amount = Number(row.amount || sub.metadata?.amount || 0);
  if (!amount || amount < 1) {
    return { subscriptionId, error: "Invalid charge amount." };
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    customer: customerId,
    payment_method: paymentMethodId,
    payment_method_types: [paymentMethodType],
    off_session: true,
    confirm: true,
    description: "Membership Auto-Pay (TEST)",
    metadata: {
      user_id: row.user_id,
      subscription_id: subscriptionId,
      test_mode: "true",
      auto_pay_test: "true",
      payment_method: dbMethod,
    },
  });

  // Card debits settle instantly ("succeeded"); ACH bank debits settle
  // asynchronously and report "processing" first — both count as accepted.
  const acceptedStatuses = isBank
    ? ["succeeded", "processing"]
    : ["succeeded"];
  if (!acceptedStatuses.includes(paymentIntent.status)) {
    return {
      subscriptionId,
      error: `Payment status: ${paymentIntent.status}`,
      paymentIntentId: paymentIntent.id,
    };
  }

  const newCount = chargesSoFar + 1;
  const nextUnix = now + Math.max(testMinutes, 1) * 60;
  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      ...sub.metadata,
      next_charge_at: String(nextUnix),
      charges_count: String(newCount),
    },
  });

  await recordTestPayment(supabase, {
    userId: row.user_id,
    amount,
    referenceNumber: paymentIntent.id,
    testMinutes,
    paymentMethod: dbMethod,
    methodLabel,
    currency,
    pending: isBank && paymentIntent.status === "processing",
  });

  // Cap reached with this charge — stop future auto-pay.
  if (newCount >= maxCharges) {
    await stopAutoPay(stripe, supabase, subscriptionId, row.user_id, newCount);
    return {
      subscriptionId,
      charged: true,
      completed: true,
      paymentIntentId: paymentIntent.id,
      amount,
      chargesSoFar: newCount,
    };
  }

  const nextChargeDate = new Date(nextUnix * 1000).toISOString().slice(0, 10);
  await supabase
    .from("recurring_contributions")
    .update({
      next_charge_date: nextChargeDate,
      status: "active",
      amount,
      description: `Membership Auto-Pay (TEST every ${testMinutes} min)`,
    })
    .eq("stripe_subscription_id", subscriptionId);

  return {
    subscriptionId,
    charged: true,
    paymentIntentId: paymentIntent.id,
    amount,
    chargesSoFar: newCount,
    nextChargeAt: new Date(nextUnix * 1000).toISOString(),
  };
}

Deno.serve(async (req) => {
  if (!isAuthorized(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeSecret || !supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing configuration." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
  const supabase = createClient(supabaseUrl, serviceKey);
  const now = Math.floor(Date.now() / 1000);
  const results: Array<Record<string, unknown>> = [];

  const { data: rows, error } = await supabase
    .from("recurring_contributions")
    .select("stripe_subscription_id, user_id, amount")
    .eq("status", "active")
    .not("stripe_subscription_id", "is", null);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  for (const row of rows || []) {
    if (!row.stripe_subscription_id) continue;
    try {
      const result = await chargeDueSubscription(stripe, supabase, {
        stripe_subscription_id: row.stripe_subscription_id,
        user_id: row.user_id,
        amount: Number(row.amount || 0),
      }, now);
      results.push(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Charge failed.";
      console.error("[process-test-autopay]", row.stripe_subscription_id, message);
      results.push({ subscriptionId: row.stripe_subscription_id, error: message });
    }
  }

  return new Response(JSON.stringify({
    processed: results.filter((r) => r.charged).length,
    checked: (rows || []).length,
    results,
  }), {
    headers: { "Content-Type": "application/json" },
  });
});
