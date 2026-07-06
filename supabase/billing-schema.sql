-- =============================================================================
-- MONTHLY MEMBERSHIP BILLING — DATABASE SCHEMA
-- =============================================================================
-- Run in Supabase SQL Editor after schema.sql
--
-- Business rules:
--   • Annual plans: Basic ₹1,200/yr | Standard ₹2,400/yr | Premium ₹3,600/yr
--   • Monthly contribution: ₹100 | ₹200 | ₹300 per month
--   • Payment window: 1st–10th of each month
--   • Auto-create Pending record on month start
--   • Paid on/before 10th → Paid + membership Active
--   • Unpaid after 10th → Overdue + membership Overdue
--   • After payment → Active + generate next month record
--   • Reminders on 5th, 8th, 10th + when overdue
-- =============================================================================

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('info', 'success', 'warning', 'household', 'payment', 'system'));

-- -----------------------------------------------------------------------------
-- 1. CONFIGURABLE MEMBERSHIP PLANS (change prices here in future)
-- -----------------------------------------------------------------------------
create table if not exists public.membership_plans (
  id            smallserial primary key,
  plan_key      text not null unique check (plan_key in ('basic', 'standard', 'premium')),
  name          text not null,
  monthly_amount numeric(12,2) not null check (monthly_amount > 0),
  currency      text not null default 'INR',
  is_active     boolean not null default true,
  sort_order    smallint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

insert into public.membership_plans (plan_key, name, monthly_amount, sort_order)
values
  ('basic',    'Basic Membership',    100, 1),
  ('standard', 'Standard Membership', 200, 2),
  ('premium',  'Premium Membership',  300, 3)
on conflict (plan_key) do update set
  name = excluded.name,
  monthly_amount = excluded.monthly_amount,
  sort_order = excluded.sort_order,
  updated_at = now();

-- -----------------------------------------------------------------------------
-- 2. BILLING RULES (singleton — edit window/reminder days without code changes)
-- -----------------------------------------------------------------------------
create table if not exists public.billing_rules (
  id                      smallint primary key default 1 check (id = 1),
  payment_window_start_day smallint not null default 1  check (payment_window_start_day between 1 and 28),
  payment_window_end_day   smallint not null default 10 check (payment_window_end_day between 1 and 28),
  billing_cycle            text not null default 'monthly' check (billing_cycle in ('monthly')),
  currency                 text not null default 'INR',
  reminder_days            int[] not null default array[5, 8, 10],
  send_overdue_reminder    boolean not null default true,
  timezone                 text not null default 'Asia/Kolkata',
  updated_at               timestamptz not null default now(),
  constraint billing_rules_window_valid check (payment_window_end_day >= payment_window_start_day)
);

insert into public.billing_rules (id)
values (1)
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 3. USER MEMBERSHIPS (one active subscription per user)
-- -----------------------------------------------------------------------------
alter table public.memberships
  add column if not exists plan_id bigint references public.membership_plans(id),
  add column if not exists monthly_amount numeric(12,2),
  add column if not exists billing_status text default 'active';

-- Expand membership status for billing lifecycle
alter table public.memberships drop constraint if exists memberships_status_check;
alter table public.memberships add constraint memberships_status_check
  check (status in ('active', 'overdue', 'paused', 'cancelled', 'pending'));

alter table public.memberships drop constraint if exists memberships_billing_status_check;
alter table public.memberships add constraint memberships_billing_status_check
  check (billing_status in ('active', 'overdue', 'paused', 'cancelled', 'pending'));

-- Link existing rows to plan catalog + correct yearly/monthly amounts
update public.memberships m
set
  plan_id = p.id,
  monthly_amount = p.monthly_amount,
  membership_name = p.name,
  annual_commitment = case p.plan_key
    when 'basic' then 1200
    when 'standard' then 2400
    when 'premium' then 3600
    else p.monthly_amount * 12
  end,
  billing_status = case
    when m.status in ('active', 'overdue') then m.status
    else coalesce(m.billing_status, 'pending')
  end
from public.membership_plans p
where lower(m.plan_key) = p.plan_key;

create unique index if not exists memberships_one_active_per_user_idx
  on public.memberships (user_id)
  where status in ('active', 'overdue', 'pending');

-- -----------------------------------------------------------------------------
-- 4. MONTHLY BILLING RECORDS (core invoice per user per month)
-- -----------------------------------------------------------------------------
create table if not exists public.membership_billing_records (
  id              bigserial primary key,
  user_id         uuid not null references auth.users(id) on delete cascade,
  membership_id   bigint not null references public.memberships(id) on delete cascade,
  plan_id         smallint not null references public.membership_plans(id),
  plan_key        text not null,
  plan_name       text not null,
  billing_period  date not null,          -- always 1st of month, e.g. 2026-07-01
  billing_year    smallint not null,
  billing_month   smallint not null check (billing_month between 1 and 12),
  amount          numeric(12,2) not null check (amount >= 0),
  currency        text not null default 'INR',
  due_date        date not null,          -- 10th of billing month
  payment_date    timestamptz,            -- when marked paid
  status          text not null default 'pending'
                  check (status in ('pending', 'paid', 'overdue')),
  overdue_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (user_id, billing_period)
);

create index if not exists membership_billing_records_user_status_idx
  on public.membership_billing_records (user_id, status);

create index if not exists membership_billing_records_due_date_idx
  on public.membership_billing_records (due_date, status);

create index if not exists membership_billing_records_period_idx
  on public.membership_billing_records (billing_year, billing_month);

-- -----------------------------------------------------------------------------
-- 5. PAYMENT TRANSACTIONS (immutable payment history linked to billing record)
-- -----------------------------------------------------------------------------
create table if not exists public.membership_payment_transactions (
  id                  bigserial primary key,
  billing_record_id   bigint not null references public.membership_billing_records(id) on delete restrict,
  user_id             uuid not null references auth.users(id) on delete cascade,
  membership_id       bigint not null references public.memberships(id) on delete cascade,
  amount              numeric(12,2) not null check (amount > 0),
  currency            text not null default 'INR',
  payment_method      text default 'card',
  payment_method_label text,
  reference_number    text,
  status              text not null default 'completed'
                      check (status in ('completed', 'failed', 'refunded')),
  paid_at             timestamptz not null default now(),
  created_at          timestamptz not null default now()
);

create index if not exists membership_payment_transactions_user_idx
  on public.membership_payment_transactions (user_id, paid_at desc);

create index if not exists membership_payment_transactions_billing_idx
  on public.membership_payment_transactions (billing_record_id);

-- -----------------------------------------------------------------------------
-- 6. REMINDER LOG (audit trail for 5th, 8th, 10th, overdue reminders)
-- -----------------------------------------------------------------------------
create table if not exists public.billing_reminder_log (
  id                bigserial primary key,
  billing_record_id bigint not null references public.membership_billing_records(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  reminder_type     text not null check (reminder_type in (
                      'pre_due_day_5', 'pre_due_day_8', 'pre_due_day_10', 'overdue'
                    )),
  channel           text not null default 'in_app' check (channel in ('in_app', 'email', 'sms')),
  sent_at           timestamptz not null default now(),
  unique (billing_record_id, reminder_type, channel)
);

-- -----------------------------------------------------------------------------
-- 7. HELPER FUNCTIONS
-- -----------------------------------------------------------------------------

-- Due date = end of payment window for a billing period
create or replace function public.billing_due_date(p_billing_period date)
returns date
language sql
stable
as $$
  select make_date(
    extract(year from p_billing_period)::int,
    extract(month from p_billing_period)::int,
    (select payment_window_end_day from public.billing_rules where id = 1)
  );
$$;

-- Next billing period (1st of next month)
create or replace function public.next_billing_period(p_billing_period date)
returns date
language sql
immutable
as $$
  select (date_trunc('month', p_billing_period) + interval '1 month')::date;
$$;

-- Create one monthly billing record (idempotent)
create or replace function public.ensure_monthly_billing_record(
  p_membership_id bigint,
  p_billing_period date default date_trunc('month', current_date)::date
)
returns public.membership_billing_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership public.memberships%rowtype;
  v_plan public.membership_plans%rowtype;
  v_record public.membership_billing_records%rowtype;
  v_period date := date_trunc('month', p_billing_period)::date;
  v_due date;
begin
  select * into v_membership from public.memberships where id = p_membership_id;
  if not found then
    raise exception 'Membership % not found', p_membership_id;
  end if;

  if v_membership.status = 'cancelled' then
    return null;
  end if;

  select * into v_plan from public.membership_plans where id = v_membership.plan_id;
  if not found then
    select * into v_plan from public.membership_plans where plan_key = v_membership.plan_key;
  end if;
  if not found then
    raise exception 'Plan not found for membership %', p_membership_id;
  end if;

  v_due := public.billing_due_date(v_period);

  insert into public.membership_billing_records (
    user_id, membership_id, plan_id, plan_key, plan_name,
    billing_period, billing_year, billing_month, amount, currency, due_date, status
  )
  values (
    v_membership.user_id,
    v_membership.id,
    v_plan.id,
    v_plan.plan_key,
    v_plan.name,
    v_period,
    extract(year from v_period)::smallint,
    extract(month from v_period)::smallint,
    coalesce(v_membership.monthly_amount, v_plan.monthly_amount),
    v_plan.currency,
    v_due,
    'pending'
  )
  on conflict (user_id, billing_period) do nothing
  returning * into v_record;

  if v_record.id is null then
    select * into v_record
    from public.membership_billing_records
    where user_id = v_membership.user_id
      and billing_period = v_period;
  end if;

  return v_record;
end;
$$;

-- Mark unpaid records overdue (run daily after the 10th)
create or replace function public.process_overdue_billing_records()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer := 0;
  v_row record;
begin
  for v_row in
    select id, user_id, membership_id
    from public.membership_billing_records
    where status = 'pending'
      and due_date < current_date
  loop
    update public.membership_billing_records
    set status = 'overdue', overdue_at = now(), updated_at = now()
    where id = v_row.id;

    update public.memberships
    set status = 'overdue', billing_status = 'overdue'
    where id = v_row.membership_id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- Record successful payment
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

-- Monthly job: create current-month pending records for all active/overdue members
create or replace function public.generate_monthly_billing_records()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_membership record;
  v_count integer := 0;
  v_period date := date_trunc('month', current_date)::date;
begin
  for v_membership in
    select id from public.memberships
    where status in ('active', 'overdue', 'pending')
      and status <> 'cancelled'
  loop
    perform public.ensure_monthly_billing_record(v_membership.id, v_period);
    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- Reminder job: 5th, 8th, 10th + overdue
create or replace function public.send_billing_reminders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rules public.billing_rules%rowtype;
  v_today int := extract(day from current_date)::int;
  v_row record;
  v_type text;
  v_count integer := 0;
  v_title text;
  v_body text;
begin
  select * into v_rules from public.billing_rules where id = 1;

  for v_row in
    select br.*, p.email, p.full_name
    from public.membership_billing_records br
    join public.profiles p on p.id = br.user_id
    where br.status in ('pending', 'overdue')
  loop
    if v_row.status = 'pending' and v_today = any(v_rules.reminder_days) then
      v_type := case v_today
        when 5 then 'pre_due_day_5'
        when 8 then 'pre_due_day_8'
        when 10 then 'pre_due_day_10'
        else null
      end;

      if v_type is not null then
        insert into public.billing_reminder_log (billing_record_id, user_id, reminder_type, channel)
        values (v_row.id, v_row.user_id, v_type, 'in_app')
        on conflict do nothing;

        if found then
          v_title := 'Membership Payment Reminder';
          v_body := format(
            'Your %s payment of ₹%s for %s is due by %s.',
            v_row.plan_name, v_row.amount::text, to_char(v_row.billing_period, 'Mon YYYY'), to_char(v_row.due_date, 'DD Mon YYYY')
          );

          insert into public.notifications (user_id, title, body, type)
          values (v_row.user_id, v_title, v_body, 'payment');

          v_count := v_count + 1;
        end if;
      end if;
    end if;

    if v_row.status = 'overdue' and v_rules.send_overdue_reminder then
      insert into public.billing_reminder_log (billing_record_id, user_id, reminder_type, channel)
      values (v_row.id, v_row.user_id, 'overdue', 'in_app')
      on conflict do nothing;

      if found then
        insert into public.notifications (user_id, title, body, type)
        values (
          v_row.user_id,
          'Payment Overdue',
          format('Your %s payment for %s is overdue. Please pay ₹%s to restore active membership.',
            v_row.plan_name, to_char(v_row.billing_period, 'Mon YYYY'), v_row.amount::text),
          'warning'
        );
        v_count := v_count + 1;
      end if;
    end if;
  end loop;

  return v_count;
end;
$$;

-- Master daily cron function (run via pg_cron or Supabase scheduled Edge Function)
create or replace function public.run_daily_billing_jobs()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_generated int := 0;
  v_overdue int := 0;
  v_reminders int := 0;
begin
  -- On 1st of month, ensure all members have current-month record
  if extract(day from current_date) = 1 then
    v_generated := public.generate_monthly_billing_records();
  else
    -- Also ensure any new signups mid-month get current record
    v_generated := public.generate_monthly_billing_records();
  end if;

  v_overdue := public.process_overdue_billing_records();
  v_reminders := public.send_billing_reminders();

  return jsonb_build_object(
    'generated', v_generated,
    'marked_overdue', v_overdue,
    'reminders_sent', v_reminders,
    'run_at', now()
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY
-- -----------------------------------------------------------------------------
alter table public.membership_plans enable row level security;
alter table public.billing_rules enable row level security;
alter table public.membership_billing_records enable row level security;
alter table public.membership_payment_transactions enable row level security;
alter table public.billing_reminder_log enable row level security;

drop policy if exists "membership_plans_read" on public.membership_plans;
create policy "membership_plans_read" on public.membership_plans
for select using (auth.role() = 'authenticated');

drop policy if exists "billing_rules_read" on public.billing_rules;
create policy "billing_rules_read" on public.billing_rules
for select using (auth.role() = 'authenticated');

drop policy if exists "billing_records_own" on public.membership_billing_records;
create policy "billing_records_own" on public.membership_billing_records
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "payment_transactions_own" on public.membership_payment_transactions;
create policy "payment_transactions_own" on public.membership_payment_transactions
for select using (auth.uid() = user_id);

drop policy if exists "reminder_log_own" on public.billing_reminder_log;
create policy "reminder_log_own" on public.billing_reminder_log
for select using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 9. UPDATE SIGNUP TRIGGER — monthly plans + first billing record
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_plan_key text := lower(coalesce(new.raw_user_meta_data ->> 'membership_plan', 'basic'));
  v_plan public.membership_plans%rowtype;
  user_full_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1));
  user_first_name text;
  user_last_name text;
  new_household_id bigint;
  new_membership_id bigint;
begin
  if selected_plan_key not in ('basic', 'standard', 'premium') then
    selected_plan_key := 'basic';
  end if;

  select * into v_plan from public.membership_plans where plan_key = selected_plan_key;

  user_first_name := split_part(user_full_name, ' ', 1);
  user_last_name := nullif(trim(substring(user_full_name from position(' ' in user_full_name) + 1)), '');

  insert into public.profiles (id, full_name, first_name, last_name, email)
  values (new.id, user_full_name, user_first_name, user_last_name, new.email)
  on conflict (id) do update set
    full_name = excluded.full_name, first_name = excluded.first_name,
    last_name = excluded.last_name, email = excluded.email, updated_at = now();

  insert into public.memberships (
    user_id, plan_id, plan_key, membership_name, status, billing_status,
    monthly_amount, annual_commitment, started_at, renewal_date, notes
  )
  values (
    new.id, v_plan.id, v_plan.plan_key, v_plan.name, 'active', 'active',
    v_plan.monthly_amount,
    case v_plan.plan_key
      when 'basic' then 1200
      when 'standard' then 2400
      when 'premium' then 3600
      else v_plan.monthly_amount * 12
    end,
    current_date, (current_date + interval '1 year')::date,
    'Thank you for joining our community.'
  )
  returning id into new_membership_id;

  perform public.ensure_monthly_billing_record(new_membership_id, date_trunc('month', current_date)::date);

  insert into public.households (user_id, name, status, member_since)
  values (new.id, user_full_name || '''s Household', 'active', current_date)
  returning id into new_household_id;

  insert into public.family_members (
    user_id, household_id, full_name, relationship, role, status, is_primary, member_since
  )
  values (new.id, new_household_id, user_full_name, 'Self', 'Owner', 'owner', true, current_date);

  insert into public.billing_contacts (user_id, full_name, email)
  values (new.id, user_full_name, new.email);

  insert into public.user_settings (user_id) values (new.id) on conflict do nothing;

  insert into public.notifications (user_id, title, body, type)
  values (
    new.id, 'Welcome to Chabad Bedford',
    'Your ' || v_plan.name || ' plan (₹' || v_plan.monthly_amount::text || '/month) is active.',
    'success'
  );

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 10. PAYMENT HISTORY VIEW (for UI / reports)
-- -----------------------------------------------------------------------------
create or replace view public.membership_payment_history as
select
  br.id as billing_record_id,
  br.user_id,
  br.plan_key,
  br.plan_name as membership_plan,
  br.billing_period,
  br.billing_year,
  br.billing_month,
  to_char(br.billing_period, 'Mon YYYY') as billing_month_label,
  br.amount,
  br.currency,
  br.due_date,
  br.payment_date,
  br.status as payment_status,
  m.status as membership_status,
  m.billing_status,
  t.id as transaction_id,
  t.payment_method,
  t.reference_number,
  t.paid_at as transaction_paid_at
from public.membership_billing_records br
join public.memberships m on m.id = br.membership_id
left join public.membership_payment_transactions t on t.billing_record_id = br.id
order by br.billing_period desc;

-- -----------------------------------------------------------------------------
-- SCHEDULED JOBS (enable pg_cron extension in Supabase if available)
-- -----------------------------------------------------------------------------
-- select cron.schedule('daily-billing', '0 1 * * *', $$select public.run_daily_billing_jobs()$$);
-- Runs daily at 1:00 AM IST — generates records, marks overdue, sends reminders
