import { supabase } from "../lib/supabase";

export async function createStripeCheckoutSession({
  amount,
  description = "Membership Contribution",
  notes = "",
  contributionType = "monthly",
  billingRecordId = null,
}) {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: {
      amount: Number(amount),
      description,
      notes,
      contributionType,
      billingRecordId,
    },
  });

  if (error) {
    throw new Error(error.message || "Failed to start Stripe checkout.");
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
    throw new Error(
      error.message ||
        "Failed to verify payment. Redeploy create-checkout-session Edge Function with latest code.",
    );
  }

  if (data?.error) {
    throw new Error(data.error);
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
