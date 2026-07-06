-- Fix wrong annual_commitment (e.g. Standard showing ₹28,800 instead of ₹2,400/year)
-- Run in Supabase SQL Editor

update public.membership_plans
set monthly_amount = case plan_key
  when 'basic' then 100
  when 'standard' then 200
  when 'premium' then 300
  else monthly_amount
end,
updated_at = now()
where plan_key in ('basic', 'standard', 'premium');

update public.memberships
set
  monthly_amount = case plan_key
    when 'basic' then 100
    when 'standard' then 200
    when 'premium' then 300
    else monthly_amount
  end,
  annual_commitment = case plan_key
    when 'basic' then 1200
    when 'standard' then 2400
    when 'premium' then 3600
    else annual_commitment
  end
where plan_key in ('basic', 'standard', 'premium');

update public.membership_billing_records
set amount = case plan_key
  when 'basic' then 100
  when 'standard' then 200
  when 'premium' then 300
  else amount
end
where amount >= 1000;

-- Verify Ali / all users
select
  u.email,
  m.plan_key,
  m.monthly_amount,
  m.annual_commitment
from public.memberships m
join auth.users u on u.id = m.user_id
order by u.email;
