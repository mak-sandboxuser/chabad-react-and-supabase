import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

async function recordCompletedSession(
  supabase: ReturnType<typeof createClient>,
  session: Stripe.Checkout.Session,
) {
  const userId = session.metadata?.user_id;
  const referenceNumber = session.id;

  if (!userId) {
    return new Response("Missing user_id in session metadata.", { status: 400 });
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
    return await recordCompletedSession(supabase, session);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
