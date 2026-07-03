-- =============================================================================
-- MIGRATE OLD DATABASE → PROPER FORMAT
-- =============================================================================
-- Run in Supabase SQL Editor (Dashboard → SQL → New query).
-- Safe to run more than once (idempotent).
--
-- BEFORE YOU RUN:
--   If tables do not exist yet, run supabase/schema.sql FIRST, then run this file.
--
-- What this does:
--   1. Backfills profiles, households, memberships for existing users
--   2. Copies household_members → family_members
--   3. Updates plan pricing to ₹1,200 / ₹2,400 / ₹3,600 per year
--   4. Updates monthly recurring amounts to ₹100 / ₹200 / ₹300
--   5. Refreshes the signup trigger for new users
-- =============================================================================

-- =============================================================================
-- STEP 1 — Backfill profiles from auth.users
-- =============================================================================
insert into public.profiles (id, full_name, first_name, last_name, email)
select
  u.id,
  coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)) as full_name,
  split_part(coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)), ' ', 1) as first_name,
  nullif(
    trim(substring(
      coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1))
      from position(' ' in coalesce(nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1))) + 1
    )),
    ''
  ) as last_name,
  u.email
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

update public.profiles p
set
  full_name = coalesce(nullif(trim(p.full_name), ''), nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)),
  first_name = split_part(
    coalesce(nullif(trim(p.full_name), ''), nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1)),
    ' ', 1
  ),
  last_name = nullif(
    trim(substring(
      coalesce(nullif(trim(p.full_name), ''), nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1))
      from position(' ' in coalesce(nullif(trim(p.full_name), ''), nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''), split_part(u.email, '@', 1))) + 1
    )),
    ''
  ),
  email = coalesce(p.email, u.email),
  updated_at = now()
from auth.users u
where p.id = u.id
  and (p.full_name is null or trim(p.full_name) = '' or p.email is null);

-- =============================================================================
-- STEP 2 — Normalize membership plans & pricing
-- =============================================================================
update public.memberships
set
  plan_key = lower(plan_key),
  membership_name = case lower(plan_key)
    when 'basic' then 'Basic Membership'
    when 'standard' then 'Standard Membership'
    when 'premium' then 'Premium Membership'
    else coalesce(membership_name, 'Basic Membership')
  end,
  annual_commitment = case lower(plan_key)
    when 'basic' then 1200
    when 'standard' then 2400
    when 'premium' then 3600
    else annual_commitment
  end,
  renewal_date = coalesce(renewal_date, (started_at + interval '1 year')::date, (current_date + interval '1 year')::date),
  notes = coalesce(notes, 'Thank you for joining our community.')
where lower(plan_key) in ('basic', 'standard', 'premium');

insert into public.memberships (user_id, plan_key, membership_name, status, annual_commitment, started_at, renewal_date, notes)
select
  u.id,
  coalesce(lower(nullif(u.raw_user_meta_data ->> 'membership_plan', '')), 'basic'),
  case coalesce(lower(nullif(u.raw_user_meta_data ->> 'membership_plan', '')), 'basic')
    when 'basic' then 'Basic Membership'
    when 'standard' then 'Standard Membership'
    when 'premium' then 'Premium Membership'
    else 'Basic Membership'
  end,
  'active',
  case coalesce(lower(nullif(u.raw_user_meta_data ->> 'membership_plan', '')), 'basic')
    when 'basic' then 1200
    when 'standard' then 2400
    when 'premium' then 3600
    else 1200
  end,
  coalesce(u.created_at::date, current_date),
  coalesce(u.created_at::date, current_date) + interval '1 year',
  'Thank you for joining our community.'
from auth.users u
where not exists (select 1 from public.memberships m where m.user_id = u.id);

-- =============================================================================
-- STEP 3 — Backfill households
-- =============================================================================
insert into public.households (user_id, name, status, member_since)
select
  p.id,
  coalesce(p.full_name, split_part(p.email, '@', 1)) || '''s Household',
  'active',
  coalesce(p.created_at::date, current_date)
from public.profiles p
where not exists (select 1 from public.households h where h.user_id = p.id);

-- =============================================================================
-- STEP 4 — Migrate household_members → family_members
-- =============================================================================
do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'household_members'
  ) then
    insert into public.family_members (
      user_id, household_id, full_name, relationship, role, status,
      date_of_birth, email, phone, preferred_contact, mailing_address,
      is_primary, member_since, created_at
    )
    select
      hm.user_id, hm.household_id, hm.full_name, hm.relationship, hm.role, hm.status,
      hm.date_of_birth, hm.email, hm.phone, hm.preferred_contact, hm.mailing_address,
      hm.is_primary, hm.member_since, hm.created_at
    from public.household_members hm
    where not exists (
      select 1 from public.family_members fm
      where fm.user_id = hm.user_id
        and fm.full_name = hm.full_name
        and coalesce(fm.relationship, '') = coalesce(hm.relationship, '')
    );
  end if;
end $$;

insert into public.family_members (
  user_id, household_id, full_name, relationship, role, status, is_primary, member_since
)
select
  p.id,
  h.id,
  coalesce(p.full_name, split_part(p.email, '@', 1)),
  'Self',
  'Owner',
  'owner',
  true,
  coalesce(h.member_since, current_date)
from public.profiles p
join public.households h on h.user_id = p.id
where not exists (
  select 1 from public.family_members fm
  where fm.user_id = p.id and fm.is_primary = true
);

-- =============================================================================
-- STEP 5 — Backfill billing, settings, notifications
-- =============================================================================
insert into public.billing_contacts (user_id, full_name, email)
select p.id, coalesce(p.full_name, split_part(p.email, '@', 1)), p.email
from public.profiles p
where not exists (select 1 from public.billing_contacts b where b.user_id = p.id);

insert into public.user_settings (user_id)
select p.id
from public.profiles p
where not exists (select 1 from public.user_settings s where s.user_id = p.id);

insert into public.notifications (user_id, title, body, type)
select
  p.id,
  'Welcome to Chabad Bedford',
  'Your account is ready. Explore your member portal.',
  'success'
from public.profiles p
where not exists (select 1 from public.notifications n where n.user_id = p.id);

-- =============================================================================
-- STEP 6 — Fix recurring monthly contribution amounts
-- =============================================================================
update public.recurring_contributions rc
set amount = case m.plan_key
  when 'basic' then 100
  when 'standard' then 200
  when 'premium' then 300
  else rc.amount
end
from public.memberships m
where rc.user_id = m.user_id
  and rc.frequency = 'monthly';

insert into public.recurring_contributions (user_id, description, amount, frequency, next_charge_date, status)
select
  m.user_id,
  m.membership_name || ' Monthly Contribution',
  case m.plan_key
    when 'basic' then 100
    when 'standard' then 200
    when 'premium' then 300
    else 100
  end,
  'monthly',
  (current_date + interval '1 month')::date,
  'active'
from public.memberships m
where not exists (
  select 1 from public.recurring_contributions rc where rc.user_id = m.user_id
);

-- =============================================================================
-- STEP 7 — Refresh signup trigger (latest format)
-- =============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_plan text := lower(coalesce(new.raw_user_meta_data ->> 'membership_plan', 'basic'));
  selected_commitment numeric(12,2);
  user_full_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1));
  user_first_name text;
  user_last_name text;
  new_household_id bigint;
  plan_display_name text;
  monthly_amount numeric(12,2);
begin
  if selected_plan not in ('basic', 'standard', 'premium') then
    selected_plan := 'basic';
  end if;

  selected_commitment := case selected_plan
    when 'basic' then 1200
    when 'standard' then 2400
    when 'premium' then 3600
    else 1200
  end;

  plan_display_name := case selected_plan
    when 'basic' then 'Basic Membership'
    when 'standard' then 'Standard Membership'
    when 'premium' then 'Premium Membership'
    else 'Basic Membership'
  end;

  monthly_amount := case selected_plan
    when 'basic' then 100
    when 'standard' then 200
    when 'premium' then 300
    else 100
  end;

  user_first_name := split_part(user_full_name, ' ', 1);
  user_last_name := nullif(trim(substring(user_full_name from position(' ' in user_full_name) + 1)), '');

  insert into public.profiles (id, full_name, first_name, last_name, email)
  values (new.id, user_full_name, user_first_name, user_last_name, new.email)
  on conflict (id) do update set
    full_name = excluded.full_name,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    updated_at = now();

  insert into public.memberships (user_id, plan_key, membership_name, status, annual_commitment, renewal_date, notes)
  values (
    new.id, selected_plan, plan_display_name, 'active', selected_commitment,
    (current_date + interval '1 year')::date, 'Thank you for joining our community.'
  );

  insert into public.recurring_contributions (user_id, description, amount, frequency, next_charge_date, status)
  values (
    new.id, plan_display_name || ' Monthly Contribution', monthly_amount, 'monthly',
    (current_date + interval '1 month')::date, 'active'
  );

  insert into public.households (user_id, name, status, member_since)
  values (new.id, user_full_name || '''s Household', 'active', current_date)
  returning id into new_household_id;

  insert into public.family_members (
    user_id, household_id, full_name, relationship, role, status, is_primary, member_since
  )
  values (new.id, new_household_id, user_full_name, 'Self', 'Owner', 'owner', true, current_date);

  insert into public.household_members (
    user_id, household_id, full_name, relationship, role, status, is_primary, member_since
  )
  values (new.id, new_household_id, user_full_name, 'Self', 'Owner', 'owner', true, current_date);

  insert into public.billing_contacts (user_id, full_name, email)
  values (new.id, user_full_name, new.email);

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notifications (user_id, title, body, type)
  values (
    new.id, 'Welcome to Chabad Bedford',
    'Your account and ' || plan_display_name || ' plan are ready.', 'success'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =============================================================================
-- STEP 8 — Verification
-- =============================================================================
select 'auth.users' as table_name, count(*)::bigint as row_count from auth.users
union all select 'profiles', count(*) from public.profiles
union all select 'memberships', count(*) from public.memberships
union all select 'households', count(*) from public.households
union all select 'family_members', count(*) from public.family_members
union all select 'billing_contacts', count(*) from public.billing_contacts
union all select 'user_settings', count(*) from public.user_settings
union all select 'notifications', count(*) from public.notifications
union all select 'recurring_contributions', count(*) from public.recurring_contributions
order by table_name;

select
  u.email,
  p.full_name,
  m.plan_key,
  m.annual_commitment,
  rc.amount as monthly_amount,
  (select count(*) from public.family_members fm where fm.user_id = u.id) as family_count
from auth.users u
left join public.profiles p on p.id = u.id
left join public.memberships m on m.user_id = u.id
left join public.recurring_contributions rc on rc.user_id = u.id and rc.frequency = 'monthly'
order by u.created_at desc
limit 10;
