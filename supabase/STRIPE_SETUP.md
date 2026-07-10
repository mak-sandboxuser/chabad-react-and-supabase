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

## 7. Test Auto-Pay (every 10 minutes)

Membership payments are **subscription Auto-Pay only** (no one-time option).

Plans:
- Basic: ₹1,200/year → ₹100/month
- Standard: ₹2,400/year → ₹200/month
- Premium: ₹3,600/year → ₹300/month

### Enable 10-minute test billing

```bash
supabase secrets set AUTO_PAY_TEST_MINUTES=10
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
```

1. Sign up with a plan → **Payments** → enable **Auto-Pay** → pay with test card `4242 4242 4242 4242`
2. First charge happens **immediately** and appears on the dashboard (Total Contributed + All Payments)
3. Every **10 minutes**, Stripe charges again; each charge is saved to `payments` and updates the dashboard
4. Webhook must include `invoice.paid` (see section 4)

### Turn off test mode (production monthly)

```bash
supabase secrets unset AUTO_PAY_TEST_MINUTES
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
```

Production renews on the **same date each month** as the first payment.

Also set frontend (optional UI copy):

```env
VITE_AUTO_PAY_TEST_MODE=true
VITE_AUTO_PAY_TEST_MINUTES=10
```


### Checklist before testing

- [ ] `auto-pay-schema.sql` has been run
- [ ] `create-checkout-session` and `stripe-webhook` are deployed
- [ ] Webhook includes `invoice.paid`
- [ ] Using **test mode** keys (not live)
- [ ] Test card: `4242 4242 4242 4242`, any future expiry, any CVC
