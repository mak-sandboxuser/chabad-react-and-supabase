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
    // Fall through to configured fallback URL.
  }

  return fallbackUrl;
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

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${siteUrl}/dashboard`,
    });

    return new Response(JSON.stringify({ url: portalSession.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Billing portal request failed.";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
