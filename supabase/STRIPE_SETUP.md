# Stripe + Supabase Setup

## 1. Stripe Dashboard

1. Create account at https://dashboard.stripe.com
2. Enable **INR** currency in Settings → Payment methods
3. Copy keys from **Developers → API keys**:
   - Publishable key: `pk_test_...`
   - Secret key: `sk_test_...`

## 2. Frontend `.env`

```env
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 3. Deploy Supabase Edge Functions

Install [Supabase CLI](https://supabase.com/docs/guides/cli), then:

```bash
supabase login
supabase link --project-ref your-project-ref

supabase secrets set STRIPE_SECRET_KEY=sk_test_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
supabase secrets set SITE_URL=http://localhost:5173
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

supabase functions deploy create-checkout-session
supabase functions deploy create-billing-portal
supabase functions deploy stripe-webhook --no-verify-jwt
```

## 4. Stripe Webhook

In Stripe Dashboard → **Developers → Webhooks → Add endpoint**:

- URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
- Events:
  - `checkout.session.completed`
  - `invoice.paid`
  - `customer.subscription.deleted`
- Copy signing secret → set as `STRIPE_WEBHOOK_SECRET`

## 4b. Stripe Customer Portal (for cancel/update auto-pay)

In Stripe Dashboard → **Settings → Billing → Customer portal**:

- Enable subscription cancellation
- Enable payment method updates

## 5. SQL

Run in Supabase SQL Editor:

- `supabase/stripe-payments.sql`
- `supabase/billing-schema.sql` (if using monthly billing records)
- `supabase/auto-pay-schema.sql` (for automatic monthly payments on the 5th)
- `supabase/fix-stripe-payment-amount.sql` (if dashboard shows annual amount instead of monthly Stripe charge)

## 6. Test

1. `npm run dev`
2. Log in → **Payments** → **Pay with Stripe**
3. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC

Payment is saved to `payments` table and a notification is created after webhook fires.

## 7. Test Auto-Pay (monthly on the 5th)

Stripe cannot bill every 10 minutes on a real monthly plan. Use one of these approaches:

### Option A — Test first charge in 10 minutes (recommended)

Use **test keys only** (`sk_test_...`). Set a temporary Supabase secret, redeploy, then enable auto-pay:

```bash
supabase secrets set AUTO_PAY_TEST_MINUTES=10
supabase functions deploy create-checkout-session
```

1. Log in → **Payments** → check **Pay automatically every month on the 5th**
2. Complete Stripe Checkout with test card `4242 4242 4242 4242`
3. Wait ~10 minutes — Stripe fires `invoice.paid` when the trial ends
4. Check **Dashboard → Recent Payments** and **Notifications**

Remove test mode when done:

```bash
supabase secrets unset AUTO_PAY_TEST_MINUTES
supabase functions deploy create-checkout-session
```

### Option B — Instant test (no waiting)

Verify the webhook and database path without waiting:

1. Ensure webhook listens for `invoice.paid` (see section 4)
2. In [Stripe Dashboard → Developers → Webhooks](https://dashboard.stripe.com/test/webhooks), open your endpoint
3. Click **Send test event** → choose `invoice.paid` → Send
4. Or use Stripe CLI:

```bash
stripe listen --forward-to https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook
stripe trigger invoice.paid
```

Note: CLI test events use fake data — good for webhook wiring, not for your exact user row. Option A is better for end-to-end testing.

### Option C — Stripe Test Clocks (advance time manually)

1. Stripe Dashboard → **Developers → Test clocks** → Create clock
2. Create the subscription customer attached to that clock
3. After setup, advance the clock by 10+ minutes to trigger the invoice

More setup, but closest to production billing simulation.

### Checklist before testing

- [ ] `auto-pay-schema.sql` has been run
- [ ] `create-checkout-session` and `stripe-webhook` are deployed
- [ ] Webhook includes `invoice.paid`
- [ ] Using **test mode** keys (not live)
- [ ] Test card: `4242 4242 4242 4242`, any future expiry, any CVC
