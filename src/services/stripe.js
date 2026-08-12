/**
 * =============================================================================
 * stripe.js — Single reusable Stripe client for any website
 * =============================================================================
 *
 * WHAT THIS FILE DOES (frontend only):
 *   1. Start Stripe Checkout (card or bank / ACH)
 *   2. Verify a completed checkout session
 *   3. Open Stripe Customer Billing Portal
 *   4. Save a card (Setup Checkout) to Stripe + Supabase
 *
 * IMPORTANT:
 *   Stripe secret keys must NEVER live in the frontend.
 *   This file calls your backend (Supabase Edge Functions by default).
 *   On another website, point `invokeFn` at your own API routes instead.
 *
 * COPY THIS FILE TO ANOTHER PROJECT:
 *   1. Copy `stripe.js` into that project (e.g. src/lib/stripe.js)
 *   2. Install deps:  npm i @supabase/supabase-js
 *   3. Add env vars (see CONFIG below)
 *   4. Deploy / reuse the same backend Edge Functions (or your own API)
 *   5. Import and call the helpers from your payment page
 *
 * =============================================================================
 */

import { createClient } from "@supabase/supabase-js";

// -----------------------------------------------------------------------------
// CONFIG — change these for your other website
// -----------------------------------------------------------------------------
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.REACT_APP_SUPABASE_URL ||
  "";

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.REACT_APP_SUPABASE_ANON_KEY ||
  "";

/** Optional publishable key if you later embed Stripe Elements */
export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY ||
  "";

/** Edge function / API route names — rename if your backend uses different paths */
const ENDPOINTS = {
  checkout: "create-checkout-session",
  billingPortal: "create-billing-portal",
  savePaymentMethod: "save-payment-method",
};

// -----------------------------------------------------------------------------
// Supabase client (shared)
// -----------------------------------------------------------------------------
let _supabase = null;

export function getSupabase() {
  if (_supabase) return _supabase;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error(
      "Missing Supabase env: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or NEXT_PUBLIC_ / REACT_APP_ equivalents).",
    );
  }
  _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return _supabase;
}

/** Inject an existing supabase client (useful if your app already has one). */
export function setSupabaseClient(client) {
  _supabase = client;
}

// -----------------------------------------------------------------------------
// Internals
// -----------------------------------------------------------------------------
async function getFunctionErrorMessage(error, fallback) {
  if (!error) return fallback;
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
        // ignore
      }
    }
  }
  return error.message || fallback;
}

async function invoke(functionName, body) {
  const supabase = getSupabase();
  const { data, error } = await supabase.functions.invoke(functionName, { body });

  if (error) {
    throw new Error(await getFunctionErrorMessage(error, `Request to ${functionName} failed.`));
  }
  if (data?.error) {
    throw new Error(data.error);
  }
  return data;
}

function siteOrigin() {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

// -----------------------------------------------------------------------------
// PUBLIC API
// -----------------------------------------------------------------------------

/**
 * Start Stripe Checkout and return `{ url, ... }`.
 * Redirect the browser:  window.location.href = result.url
 *
 * @param {object} options
 * @param {number|string} options.amount          Amount in dollars (e.g. 100)
 * @param {string}  [options.description]         Line item description
 * @param {string}  [options.notes]               Optional notes
 * @param {boolean} [options.autoPay=true]        Subscription / recurring
 * @param {string}  [options.planKey]             e.g. "basic" | "standard" | "premium"
 * @param {string}  [options.paymentMethod="card"] "card" | "bank"
 * @param {string}  [options.returnBaseUrl]       Where Stripe should return after pay
 */
export async function createStripeCheckoutSession({
  amount,
  description = "Payment",
  notes = "",
  contributionType = "monthly",
  autoPay = true,
  planKey = "",
  paymentMethod = "card",
  returnBaseUrl,
} = {}) {
  if (amount == null || Number(amount) <= 0) {
    throw new Error("A valid amount is required to start checkout.");
  }

  const data = await invoke(ENDPOINTS.checkout, {
    amount: Number(amount),
    description,
    notes,
    contributionType,
    autoPay: Boolean(autoPay),
    planKey,
    paymentMethod,
    returnBaseUrl: returnBaseUrl || siteOrigin(),
  });

  if (!data?.url) {
    throw new Error(
      `Stripe checkout URL missing. Deploy the "${ENDPOINTS.checkout}" backend function.`,
    );
  }

  return data;
}

/**
 * Redirect helper — starts checkout then sends the user to Stripe.
 */
export async function redirectToStripeCheckout(options) {
  const { url } = await createStripeCheckoutSession(options);
  window.location.href = url;
  return url;
}

/**
 * After Stripe redirects back with ?session_id=..., verify the payment.
 * Call this on your success / payments return page.
 *
 * @param {string} sessionId  From URL search params
 */
export async function verifyStripeCheckoutSession(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId is required to verify checkout.");
  }

  return invoke(ENDPOINTS.checkout, {
    action: "verify",
    sessionId,
  });
}

/**
 * Open Stripe Customer Portal (update card, cancel subscription, invoices).
 * Redirect: window.location.href = result.url
 */
export async function createBillingPortalSession({ returnBaseUrl } = {}) {
  const data = await invoke(ENDPOINTS.billingPortal, {
    returnBaseUrl: returnBaseUrl || siteOrigin(),
  });

  if (!data?.url) {
    throw new Error(
      `Billing portal URL missing. Deploy the "${ENDPOINTS.billingPortal}" backend function.`,
    );
  }

  return data;
}

export async function redirectToBillingPortal(options) {
  const { url } = await createBillingPortalSession(options);
  window.location.href = url;
  return url;
}

/**
 * Read ?session_id= / ?success= / ?canceled= / ?setup= from the current URL
 * after returning from Stripe Checkout.
 */
export function getCheckoutReturnParams(search = typeof window !== "undefined" ? window.location.search : "") {
  const params = new URLSearchParams(search);
  return {
    sessionId: params.get("session_id") || params.get("sessionId") || "",
    success: params.get("success") === "true" || params.get("subscription") === "success",
    canceled: params.get("canceled") === "true",
    setupSuccess: params.get("setup") === "success",
    setupCanceled: params.get("setup") === "canceled",
  };
}

/**
 * Start Stripe Setup Checkout to save a card (no charge).
 * Uses create-checkout-session Edge Function (action: save_card).
 * Redirect: window.location.href = result.url
 *
 * On return, call verifySavedPaymentMethod(sessionId).
 */
export async function createSaveCardSession({
  makePrimary = true,
  returnBaseUrl,
} = {}) {
  const data = await invoke(ENDPOINTS.checkout, {
    action: "save_card",
    makePrimary: Boolean(makePrimary),
    returnBaseUrl: returnBaseUrl || siteOrigin(),
  });

  if (!data?.url) {
    throw new Error(
      `Save-card URL missing. Redeploy the "${ENDPOINTS.checkout}" Edge Function with latest code.`,
    );
  }

  return data;
}

export async function redirectToSaveCard(options) {
  const { url } = await createSaveCardSession(options);
  window.location.href = url;
  return url;
}

/**
 * After Setup Checkout returns with ?setup=success&session_id=...,
 * verify and save the card to Supabase payment_methods.
 */
export async function verifySavedPaymentMethod(sessionId) {
  if (!sessionId) {
    throw new Error("sessionId is required to verify the saved card.");
  }

  return invoke(ENDPOINTS.checkout, {
    action: "verify_setup",
    sessionId,
  });
}

/**
 * Remove a saved card from Stripe and Supabase payment_methods.
 * @param {{ id?: number|string, stripePaymentMethodId?: string }} card
 */
export async function removeSavedPaymentMethod(card = {}) {
  const id = card.id;
  const stripePaymentMethodId = card.stripePaymentMethodId || card.stripe_payment_method_id;

  if (id == null && !stripePaymentMethodId) {
    throw new Error("Card id is required to remove a payment method.");
  }

  return invoke(ENDPOINTS.checkout, {
    action: "remove_card",
    id,
    stripePaymentMethodId,
  });
}

/**
 * Optional: fetch a pending bill row (Chabad-specific table).
 * Safe to ignore on other websites.
 */
export async function fetchPendingBillingRecord(userId) {
  if (!userId) return null;
  const supabase = getSupabase();
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

// Default export for simple imports:  import stripe from "./stripe"
const stripe = {
  createStripeCheckoutSession,
  redirectToStripeCheckout,
  verifyStripeCheckoutSession,
  createBillingPortalSession,
  redirectToBillingPortal,
  createSaveCardSession,
  redirectToSaveCard,
  verifySavedPaymentMethod,
  removeSavedPaymentMethod,
  getCheckoutReturnParams,
  fetchPendingBillingRecord,
  getSupabase,
  setSupabaseClient,
  STRIPE_PUBLISHABLE_KEY,
};

export default stripe;
