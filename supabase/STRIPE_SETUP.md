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
supabase functions deploy stripe-webhook --no-verify-jwt
```

## 4. Stripe Webhook

In Stripe Dashboard → **Developers → Webhooks → Add endpoint**:

- URL: `https://YOUR_PROJECT.supabase.co/functions/v1/stripe-webhook`
- Events: `checkout.session.completed`
- Copy signing secret → set as `STRIPE_WEBHOOK_SECRET`

## 5. SQL

Run in Supabase SQL Editor:

- `supabase/stripe-payments.sql`
- `supabase/billing-schema.sql` (if using monthly billing records)
- `supabase/fix-stripe-payment-amount.sql` (if dashboard shows annual amount instead of monthly Stripe charge)

## 6. Test

1. `npm run dev`
2. Log in → **Payments** → **Pay with Stripe**
3. Use test card: `4242 4242 4242 4242`, any future expiry, any CVC

Payment is saved to `payments` table and a notification is created after webhook fires.
