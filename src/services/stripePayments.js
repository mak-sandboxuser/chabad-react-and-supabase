/**
 * Project adapter — wires the shared app Supabase client into stripe.js
 * and re-exports the public API. Prefer importing from `./stripe` when
 * copying to another website (that file is standalone).
 */
import { supabase } from "../lib/supabase";
import stripe, { setSupabaseClient } from "./stripe";

setSupabaseClient(supabase);

export {
  createStripeCheckoutSession,
  verifyStripeCheckoutSession,
  createBillingPortalSession,
  fetchPendingBillingRecord,
  redirectToStripeCheckout,
  redirectToBillingPortal,
  createSaveCardSession,
  redirectToSaveCard,
  verifySavedPaymentMethod,
  removeSavedPaymentMethod,
  getCheckoutReturnParams,
  setSupabaseClient,
  getSupabase,
  STRIPE_PUBLISHABLE_KEY,
} from "./stripe";

export default stripe;
