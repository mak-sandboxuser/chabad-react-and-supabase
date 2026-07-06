-- Stripe payment support — run in Supabase SQL Editor

create unique index if not exists payments_reference_number_unique_idx
  on public.payments (reference_number)
  where reference_number is not null;
