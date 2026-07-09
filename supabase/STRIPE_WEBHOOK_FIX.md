# Stripe Webhook Fix — Payments not showing in Supabase

Stripe shows **Succeeded** but `payments` table is empty?  
Your **stripe-webhook** is not receiving events (or missing `invoice.paid`).

## Step 1 — Stripe Dashboard → Webhooks

1. Open https://dashboard.stripe.com/test/webhooks
2. Click **Add endpoint** (or edit existing)
3. Endpoint URL (exact):

```
https://bifcjbwvzpbfpfowxjkt.supabase.co/functions/v1/stripe-webhook
```

4. Select these events:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`

5. Click **Add endpoint**
6. Copy **Signing secret** (`whsec_...`)

## Step 2 — Supabase Secrets

```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_NEW_SECRET
```

> Important: If you create a **new** webhook, the old `whsec_` secret will NOT work.

## Step 3 — Deploy webhook function

```bash
npx supabase functions deploy stripe-webhook --no-verify-jwt
npx supabase functions deploy create-checkout-session
```

## Step 4 — Test webhook

In Stripe → your webhook → **Send test event** → choose `invoice.paid`

Check Supabase → Edge Functions → `stripe-webhook` → **Logs**  
You should see requests (not 0).

## Step 5 — Verify payments table

```sql
select amount, description, status, reference_number, paid_at
from public.payments
order by paid_at desc
limit 20;
```

## Why this happened

| Payment type | What code did before | Fix |
|--------------|---------------------|-----|
| One-time pay | Saved to `payments` | Already worked |
| Auto-pay subscription | Only saved "Auto-Pay Enabled" notification | Now also saves paid invoice to `payments` |
| Webhook missing | Stripe charged but Supabase never notified | Add `invoice.paid` event |

## Backfill missed payment (manual)

If Stripe already charged but Supabase has no row, pay again from website after fix —  
OR run verify by opening the success URL once:

```
https://YOUR-SITE/payments?subscription=success&session_id=cs_test_...
```

The updated code will read the Stripe invoice and insert into `payments`.
