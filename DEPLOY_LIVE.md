# Deploy Auto-Pay to Live Website

If you see **Payments** page but **no Auto-Pay checkbox**, your live site is running an old build. Follow these steps.

## Step 1 — Confirm code is on GitHub

```bash
git status
git push origin main
```

You should see `PaymentDetailsForm.jsx` with text: `Pay automatically every month on the 5th`.

## Step 2 — Redeploy frontend (Vercel)

1. Open https://vercel.com/dashboard
2. Open your **chabad** / **frontend** project
3. Go to **Deployments**
4. Click **Redeploy** on the latest deployment  
   OR push a new commit to `main` (Vercel auto-deploys)
5. Wait until status is **Ready**

## Step 3 — Hard refresh browser

On your live website:

- Windows: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

Or open the site in **Incognito / Private** window.

## Step 4 — Verify Auto-Pay appears

1. Log in on live site
2. Go to **Payments**
3. Select **Monthly Membership**
4. You should see a blue **Auto-Pay** box with checkbox:
   - "Pay automatically every month on the 5th"

**Quick check:** Right-click page → View Page Source → search for `Pay automatically every month`.  
If not found, live site still has old build — repeat Step 2.

## Step 5 — Deploy Supabase Edge Functions (backend)

Auto-pay also needs updated backend on Supabase:

```bash
supabase login
supabase link --project-ref bifcjbwvzpbfpfowxjkt

supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
supabase functions deploy create-billing-portal
```

## Step 6 — Run SQL (one time)

In Supabase SQL Editor, run:

- `supabase/auto-pay-schema.sql`

## Step 7 — Stripe webhook (live or test)

Stripe Dashboard → Webhooks → your endpoint must include:

- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.deleted`

## Step 8 — Set live SITE_URL

```bash
supabase secrets set SITE_URL=https://YOUR-LIVE-DOMAIN.com
```

Replace with your real Vercel URL (e.g. `https://chabad-xxx.vercel.app`).

## Fix: "localhost refused to connect" after Stripe payment

**Cause:** Stripe redirected to `localhost:5173` but your dev server was not running, or you paid on live site while `SITE_URL` was still localhost.

**Fix A (live website):**
1. Push latest frontend code (sends your real site URL to Stripe)
2. Deploy edge functions:
   ```bash
   supabase functions deploy create-checkout-session
   supabase functions deploy create-billing-portal
   ```
3. Set live URL:
   ```bash
   supabase secrets set SITE_URL=https://YOUR-LIVE-VERCEL-URL.vercel.app
   ```
4. Pay again from your **live** website (not localhost)

**Fix B (local testing):**
1. Start dev server and keep it running:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173` and pay from there
3. Do not close terminal until Stripe redirects back

## Step 9 — Test auto-pay

1. Payments → Monthly → check Auto-Pay
2. Click **Set Up Auto-Pay with Stripe**
3. Use test card: `4242 4242 4242 4242`

For 5-minute test (test mode only):

```bash
supabase secrets set AUTO_PAY_TEST_MINUTES=5
supabase functions deploy create-checkout-session
```

Remove after testing:

```bash
supabase secrets unset AUTO_PAY_TEST_MINUTES
supabase functions deploy create-checkout-session
```
