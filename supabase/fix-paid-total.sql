-- Fix dashboard showing ₹2,400 contributed when you only paid ₹200.
-- Old demo rows in `contributions` were counted even though real money is in `payments`.
-- Run in Supabase SQL Editor (replace email if needed).

-- 1) See what is stored now
select 'payments' as source, amount, description, status, paid_at::date
from public.payments
where user_id = (select id from auth.users where lower(email) = 'ali@gmail.com' limit 1)
union all
select 'contributions', amount, contribution_type, status, due_date::date
from public.contributions
where user_id = (select id from auth.users where lower(email) = 'ali@gmail.com' limit 1)
order by source, paid_at;

-- 2) Remove incorrect paid contribution rows (dashboard no longer uses these for totals)
delete from public.contributions
where user_id = (select id from auth.users where lower(email) = 'ali@gmail.com' limit 1)
  and status = 'paid';

-- 3) Remove any ₹2,400 payment rows you did not make (optional — annual demo payment)
delete from public.payments
where user_id = (select id from auth.users where lower(email) = 'ali@gmail.com' limit 1)
  and amount = 2400;

-- 4) Ensure one pending monthly contribution remains (₹200)
insert into public.contributions (user_id, amount, status, contribution_type, due_date)
select
  u.id,
  200,
  'pending',
  'monthly',
  (current_date + interval '15 days')::date
from auth.users u
where lower(u.email) = 'ali@gmail.com'
  and not exists (
    select 1 from public.contributions c
    where c.user_id = u.id and c.status = 'pending'
  );

-- 5) Verify totals
select
  u.email,
  (select coalesce(sum(amount), 0) from public.payments p where p.user_id = u.id and p.status = 'paid') as total_paid,
  (select count(*) from public.payments p where p.user_id = u.id and p.status = 'paid') as payment_count
from auth.users u
where lower(u.email) = 'ali@gmail.com';
