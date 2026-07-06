-- Delete "Annual Standard Membership" ₹2,400 payment for ali@gmail.com
-- Run in Supabase SQL Editor

delete from public.payments
where user_id = (select id from auth.users where lower(email) = 'ali@gmail.com' limit 1)
  and amount = 2400
  and description = 'Annual Standard Membership';

delete from public.contributions
where user_id = (select id from auth.users where lower(email) = 'ali@gmail.com' limit 1)
  and amount = 2400
  and contribution_type = 'annual';

-- Verify remaining payments
select paid_at::date as date, description, amount, status
from public.payments
where user_id = (select id from auth.users where lower(email) = 'ali@gmail.com' limit 1)
order by paid_at desc;
