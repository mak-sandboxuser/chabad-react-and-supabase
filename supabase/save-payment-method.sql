-- Save Stripe payment methods to Supabase
-- Run once in Supabase SQL Editor

alter table public.payment_methods
  add column if not exists stripe_payment_method_id text;

create unique index if not exists payment_methods_stripe_pm_unique_idx
  on public.payment_methods (stripe_payment_method_id)
  where stripe_payment_method_id is not null;

comment on column public.payment_methods.stripe_payment_method_id is
  'Stripe PaymentMethod id (pm_...), linked when user saves a card via Setup Checkout';
