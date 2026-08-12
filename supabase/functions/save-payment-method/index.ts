import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

    if (url.protocol === "https:" && url.hostname.endsWith(".vercel.app")) {
      return origin;
    }
  } catch {
    // Fall through
  }

  return fallbackUrl;
}

async function ensureCustomer(
  stripe: Stripe,
  supabaseAdmin: ReturnType<typeof createClient>,
  user: { id: string; email?: string | null },
) {
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("stripe_customer_id, full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  let customerId = profile?.stripe_customer_id as string | null | undefined;

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

  return customerId;
}

function cardExpiresAt(card?: Stripe.PaymentMethod.Card | null) {
  if (!card?.exp_year || !card?.exp_month) return null;
  const month = String(card.exp_month).padStart(2, "0");
  return `${card.exp_year}-${month}-01`;
}

async function savePaymentMethodToDb(
  supabaseAdmin: ReturnType<typeof createClient>,
  userId: string,
  pm: Stripe.PaymentMethod,
  makePrimary: boolean,
) {
  const stripePmId = pm.id;
  const type = pm.type === "us_bank_account" ? "bank" : "card";
  const brand = pm.card?.brand || pm.us_bank_account?.bank_name || null;
  const lastFour = pm.card?.last4 || pm.us_bank_account?.last4 || null;
  const expiresAt = cardExpiresAt(pm.card);

  const { data: existing } = await supabaseAdmin
    .from("payment_methods")
    .select("id")
    .eq("stripe_payment_method_id", stripePmId)
    .maybeSingle();

  if (existing?.id) {
    return { id: existing.id, alreadySaved: true, brand, lastFour, type };
  }

  if (makePrimary) {
    await supabaseAdmin
      .from("payment_methods")
      .update({ is_primary: false })
      .eq("user_id", userId)
      .eq("is_primary", true);
  }

  const { data: inserted, error } = await supabaseAdmin
    .from("payment_methods")
    .insert({
      user_id: userId,
      type,
      brand,
      last_four: lastFour,
      is_primary: makePrimary,
      expires_at: expiresAt,
      stripe_payment_method_id: stripePmId,
    })
    .select("id")
    .single();

  if (error) throw error;

  await supabaseAdmin.from("notifications").insert({
    user_id: userId,
    title: "Card saved",
    body: brand && lastFour
      ? `Your ${brand} card ending in ${lastFour} was saved for future payments.`
      : "Your payment method was saved for future payments.",
    type: "payment",
  });

  return { id: inserted.id, alreadySaved: false, brand, lastFour, type };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  try {
    const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const configuredSiteUrl = Deno.env.get("SITE_URL") || "http://localhost:5173";

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

    const body = await req.json().catch(() => ({}));
    const siteUrl = resolveReturnBaseUrl(body.returnBaseUrl, configuredSiteUrl);
    const stripe = new Stripe(stripeSecret, { apiVersion: "2023-10-16" });
    const supabaseAdmin = createClient(supabaseUrl, serviceKey);
    const action = String(body.action || "create").toLowerCase();

    // ----- VERIFY setup checkout and save card to DB -----
    if (action === "verify") {
      const sessionId = body.sessionId;
      if (!sessionId) {
        return new Response(JSON.stringify({ error: "sessionId is required." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const session = await stripe.checkout.sessions.retrieve(String(sessionId), {
        expand: ["setup_intent", "setup_intent.payment_method"],
      });

      if (session.metadata?.user_id && session.metadata.user_id !== user.id) {
        return new Response(JSON.stringify({ error: "Session does not belong to this user." }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (session.mode !== "setup") {
        return new Response(JSON.stringify({ error: "Not a card-setup session." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (session.status !== "complete") {
        return new Response(JSON.stringify({
          error: "Card setup is not complete yet.",
          status: session.status,
        }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const setupIntent = session.setup_intent as Stripe.SetupIntent | null;
      const pmRef = setupIntent?.payment_method;
      const paymentMethodId = typeof pmRef === "string" ? pmRef : pmRef?.id;

      if (!paymentMethodId) {
        return new Response(JSON.stringify({ error: "No payment method found on setup session." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
      const customerId = await ensureCustomer(stripe, supabaseAdmin, user);

      if (pm.customer !== customerId) {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
      }

      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      const makePrimary = session.metadata?.make_primary !== "false";
      const saved = await savePaymentMethodToDb(supabaseAdmin, user.id, pm, makePrimary);

      return new Response(JSON.stringify({
        success: true,
        ...saved,
        stripePaymentMethodId: paymentMethodId,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ----- CREATE setup checkout (add card, no charge) -----
    const customerId = await ensureCustomer(stripe, supabaseAdmin, user);
    const makePrimary = body.makePrimary !== false && body.makePrimary !== "false";

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: customerId,
      payment_method_types: ["card"],
      metadata: {
        user_id: user.id,
        purpose: "save_card",
        make_primary: makePrimary ? "true" : "false",
      },
      success_url: `${siteUrl}/payments?setup=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payments?setup=canceled`,
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save card request failed.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
