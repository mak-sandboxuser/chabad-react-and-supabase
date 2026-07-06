-- Auto-pay on the 5th of each month via Stripe Subscriptions
-- Run in Supabase SQL Editor after billing-schema.sql

alter table public.recurring_contributions
  add column if not exists stripe_subscription_id text,
  add column if not exists charge_day_of_month smallint default 5
    check (charge_day_of_month between 1 and 28);

alter table public.memberships
  add column if not exists stripe_subscription_id text;

create unique index if not exists recurring_contributions_stripe_sub_idx
  on public.recurring_contributions (stripe_subscription_id)
  where stripe_subscription_id is not null;

-- Default billing reminder day is already 5 in billing_rules.reminder_days
