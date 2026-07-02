-- Optional: run after schema.sql to add sample data for an existing user.
-- Replace USER_ID with your auth.users id from Supabase Authentication > Users.

-- Example:
-- select id, email from auth.users;

/*
insert into public.payments (user_id, amount, description, status, payment_method, payment_method_label, reference_number, paid_at)
values
  ('USER_ID', 999, 'Annual Membership', 'paid', 'card', 'Visa ending in 4242', 'TXN-2026-0001', now() - interval '30 days'),
  ('USER_ID', 250, 'Monthly Contribution', 'paid', 'card', 'Visa ending in 4242', 'TXN-2026-0002', now() - interval '15 days');

insert into public.contributions (user_id, amount, status, contribution_type, due_date)
values
  ('USER_ID', 250, 'paid', 'monthly', current_date - interval '15 days'),
  ('USER_ID', 250, 'pending', 'monthly', current_date + interval '15 days');

insert into public.recurring_contributions (user_id, description, amount, frequency, next_charge_date, status)
values
  ('USER_ID', 'Monthly Membership Contribution', 250, 'monthly', current_date + interval '15 days', 'active');

insert into public.payment_methods (user_id, type, brand, last_four, is_primary, expires_at)
values
  ('USER_ID', 'card', 'Visa', '4242', true, '2028-12-01');
*/
