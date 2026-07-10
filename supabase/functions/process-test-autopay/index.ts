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

function isAuthorized(req: Request) {
  const cronSecret = Deno.env.get("CRON_SECRET");
  if (cronSecret && req.headers.get("x-cron-secret") === cronSecret) {
    return true;
  }
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const auth = req.headers.get("Authorization");
  return Boolean(serviceKey && auth === `Bearer ${serviceKey}`);
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
    const subscriptionId = row.stripe_subscription_id;
    if (!subscriptionId) continue;

    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      if (!isTestSubscription(sub)) continue;
      if (sub.status === "canceled" || sub.status === "incomplete_expired") continue;

      const testMinutes = getTestMinutes(sub);
      let nextChargeAt = Number(sub.metadata?.next_charge_at || 0);

      // Backfill schedule for subscriptions created before metadata-based billing.
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
        results.push({
          subscriptionId,
          skipped: true,
          reason: "backfilled_next_charge_at",
          nextChargeAt: new Date(nextChargeAt * 1000).toISOString(),
        });
        continue;
      }

      if (now < nextChargeAt) {
        results.push({
          subscriptionId,
          skipped: true,
          reason: "not_due_yet",
          nextChargeAt: new Date(nextChargeAt * 1000).toISOString(),
        });
        continue;
      }

      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
      if (!customerId) continue;

      // Push next charge forward immediately so overlapping cron runs don't double-bill.
      const nextUnix = now + Math.max(testMinutes, 1) * 60;
      await stripe.subscriptions.update(subscriptionId, {
        metadata: {
          ...sub.metadata,
          next_charge_at: String(nextUnix),
        },
      });

      const invoice = await stripe.invoices.create({
        customer: customerId,
        subscription: subscriptionId,
        auto_advance: true,
        description: "Membership Auto-Pay (TEST)",
      });

      let paidInvoice = invoice;
      if (invoice.status === "draft") {
        paidInvoice = await stripe.invoices.finalizeInvoice(invoice.id);
      }
      if (paidInvoice.status === "open") {
        try {
          paidInvoice = await stripe.invoices.pay(paidInvoice.id);
        } catch (payErr) {
          console.error("[process-test-autopay] pay failed:", payErr);
        }
      }

      results.push({
        subscriptionId,
        invoiceId: paidInvoice.id,
        status: paidInvoice.status,
        charged: paidInvoice.status === "paid",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Charge failed.";
      console.error("[process-test-autopay]", subscriptionId, message);
      results.push({ subscriptionId, error: message });
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
