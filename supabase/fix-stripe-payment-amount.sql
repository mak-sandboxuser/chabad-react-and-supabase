-- Fix payments recorded at annual price (₹2,400) instead of actual Stripe charge (₹200).
-- Run in Supabase SQL Editor after deploying updated Edge Functions.

-- 1) Update RPC to accept actual paid amount (re-run from billing-schema.sql or this block)
create or replace function public.complete_membership_payment(
  p_billing_record_id bigint,
  p_payment_method text default 'card',
  p_payment_method_label text default null,
  p_reference_number text default null,
  p_paid_at timestamptz default now(),
  p_paid_amount numeric(12,2) default null
)
returns public.membership_payment_transactions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_bill public.membership_billing_records%rowtype;
  v_txn public.membership_payment_transactions%rowtype;
  v_next_period date;
  v_amount numeric(12,2);
begin
  select * into v_bill
  from public.membership_billing_records
  where id = p_billing_record_id
  for update;

  if not found then
    raise exception 'Billing record % not found', p_billing_record_id;
  end if;

  if v_bill.status = 'paid' then
    raise exception 'Billing record % is already paid', p_billing_record_id;
  end if;

  v_amount := coalesce(p_paid_amount, v_bill.amount);

  insert into public.membership_payment_transactions (
    billing_record_id, user_id, membership_id, amount, currency,
    payment_method, payment_method_label, reference_number, paid_at
  )
  values (
    v_bill.id, v_bill.user_id, v_bill.membership_id, v_amount, v_bill.currency,
    p_payment_method, p_payment_method_label, p_reference_number, p_paid_at
  )
  returning * into v_txn;

  update public.membership_billing_records
  set status = 'paid', amount = v_amount, payment_date = p_paid_at, updated_at = now()
  where id = v_bill.id;

  update public.memberships
  set status = 'active', billing_status = 'active'
  where id = v_bill.membership_id;

  v_next_period := public.next_billing_period(v_bill.billing_period);
  perform public.ensure_monthly_billing_record(v_bill.membership_id, v_next_period);

  insert into public.payments (
    user_id, amount, description, status, payment_method,
    payment_method_label, reference_number, contribution_type, paid_at
  )
  values (
    v_bill.user_id,
    v_amount,
    v_bill.plan_name || ' — ' || to_char(v_bill.billing_period, 'Mon YYYY'),
    'paid',
    p_payment_method,
    p_payment_method_label,
    p_reference_number,
    'monthly',
    p_paid_at
  );

  return v_txn;
end;
$$;

-- 2) Correct payments wrongly stored at annual commitment instead of monthly amount
update public.payments p
set amount = m.monthly_amount
from public.memberships m
where p.user_id = m.user_id
  and p.contribution_type = 'monthly'
  and p.amount = m.annual_commitment
  and m.monthly_amount is not null
  and m.annual_commitment > m.monthly_amount;

-- 3) Fix billing records that used annual price as the monthly bill
update public.membership_billing_records mbr
set amount = m.monthly_amount
from public.memberships m
where mbr.membership_id = m.id
  and mbr.amount = m.annual_commitment
  and m.monthly_amount is not null
  and m.annual_commitment > m.monthly_amount;

-- 4) Fix transaction mirror table if present
update public.membership_payment_transactions t
set amount = m.monthly_amount
from public.memberships m
where t.membership_id = m.id
  and t.amount = m.annual_commitment
  and m.monthly_amount is not null
  and m.annual_commitment > m.monthly_amount;

-- 5) Verify (change username filter as needed — demo3 shown in portal)
select
  pr.full_name,
  p.amount,
  p.description,
  p.status,
  p.paid_at::date
from public.payments p
join public.profiles pr on pr.id = p.user_id
where lower(pr.full_name) like '%demo3%'
   or lower(pr.full_name) = 'demo3'
order by p.paid_at desc;
