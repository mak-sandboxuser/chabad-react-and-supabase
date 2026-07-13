import { supabase } from "../lib/supabase";

async function getEdgeFunctionErrorMessage(error, fallbackMessage) {
  if (!error) return fallbackMessage;
  const context = error.context;
  if (context) {
    try {
      const payload = await context.json();
      if (payload?.error) return payload.error;
    } catch {
      try {
        const text = await context.text();
        if (text) return text;
      } catch {
        // Ignore parse errors and fall through to generic message.
      }
    }
  }
  return error.message || fallbackMessage;
}

export async function createStripeCheckoutSession({
  amount,
  description = "Membership Monthly Auto-Pay",
  notes = "",
  contributionType = "monthly",
  autoPay = true,
  planKey = "",
  paymentMethod = "card",
}) {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: {
      amount: Number(amount),
      description,
      notes,
      contributionType: "monthly",
      autoPay: true,
      planKey,
      paymentMethod,
      returnBaseUrl: window.location.origin,
    },
  });

  if (error) {
    throw new Error(await getEdgeFunctionErrorMessage(error, "Failed to start Stripe checkout."));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.url) {
    throw new Error("Stripe checkout URL was not returned. Deploy the create-checkout-session Edge Function.");
  }

  return data;
}

export async function verifyStripeCheckoutSession(sessionId) {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: { action: "verify", sessionId },
  });

  if (error) {
    throw new Error(await getEdgeFunctionErrorMessage(
      error,
      "Failed to verify payment. Redeploy create-checkout-session Edge Function with latest code.",
    ));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function createBillingPortalSession() {
  const { data, error } = await supabase.functions.invoke("create-billing-portal", {
    body: {
      returnBaseUrl: window.location.origin,
    },
  });

  if (error) {
    throw new Error(await getEdgeFunctionErrorMessage(error, "Failed to open billing portal."));
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  if (!data?.url) {
    throw new Error("Billing portal URL was not returned. Deploy the create-billing-portal Edge Function.");
  }

  return data;
}

export async function fetchPendingBillingRecord(userId) {
  const { data, error } = await supabase
    .from("membership_billing_records")
    .select("id, amount, plan_name, billing_period, due_date, status")
    .eq("user_id", userId)
    .in("status", ["pending", "overdue"])
    .order("billing_period", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error && error.code !== "PGRST205") throw error;
  return data;
}
