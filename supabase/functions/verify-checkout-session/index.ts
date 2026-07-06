import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function recordCompletedSession(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.user_id;
  const referenceNumber = session.id;

  if (!userId) {
    throw new Error("Missing user_id in Stripe session.");
  }

  const { data: existing } = await supabase
    .from("payments")
    .select("id")
    .eq("reference_number", referenceNumber)
    .maybeSingle();

  if (existing) {
    return { alreadyRecorded: true, amount: (session.amount_total || 0) / 100 };
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

  return { alreadyRecorded: false, amount };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeSecret || !supabaseUrl || !supabaseAnonKey || !serviceKey) {
      throw new Error("Missing Stripe or Supabase environment variables.");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Not authenticated." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabaseUser.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { sessionId } = await req.json();
    if (!sessionId) {
      return new Response(JSON.stringify({ error: "Missing sessionId." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.metadata?.user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Payment does not belong to this user." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({
        error: "Payment is not completed yet.",
        paymentStatus: session.payment_status,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const result = await recordCompletedSession(supabaseAdmin, session);

    return new Response(JSON.stringify({
      success: true,
      amount: result.amount,
      alreadyRecorded: result.alreadyRecorded,
      paymentStatus: session.payment_status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to verify payment.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
