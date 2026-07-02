-- Run this in Supabase SQL Editor.
-- Creates family_members table connected to auth.users (each login user owns their family list).

create table if not exists public.family_members (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id bigint references public.households(id) on delete set null,
  full_name text not null,
  relationship text not null default 'Self',
  role text not null default 'Member',
  status text not null default 'member',
  date_of_birth date,
  email text,
  phone text,
  preferred_contact text default 'email',
  mailing_address text,
  is_primary boolean not null default false,
  member_since date default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists family_members_user_id_idx on public.family_members(user_id);
create index if not exists family_members_household_id_idx on public.family_members(household_id);

alter table public.family_members enable row level security;

drop policy if exists "family_members_own_rows" on public.family_members;
create policy "family_members_own_rows" on public.family_members
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Copy old data from household_members if that table already exists
do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'household_members'
  ) then
    insert into public.family_members (
      user_id, household_id, full_name, relationship, role, status,
      date_of_birth, email, phone, preferred_contact, mailing_address,
      is_primary, member_since, created_at
    )
    select
      user_id, household_id, full_name, relationship, role, status,
      date_of_birth, email, phone, preferred_contact, mailing_address,
      is_primary, member_since, created_at
    from public.household_members hm
    where not exists (
      select 1 from public.family_members fm
      where fm.user_id = hm.user_id
        and fm.full_name = hm.full_name
        and coalesce(fm.relationship, '') = coalesce(hm.relationship, '')
    );
  end if;
end $$;

-- Keep signup trigger writing into family_members
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_plan text := lower(coalesce(new.raw_user_meta_data ->> 'membership_plan', 'basic'));
  selected_commitment numeric(12,2);
  user_full_name text := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));
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
    new.id,
    selected_plan,
    plan_display_name,
    'active',
    selected_commitment,
    (current_date + interval '1 year')::date,
    'Thank you for joining our community.'
  );

  insert into public.recurring_contributions (user_id, description, amount, frequency, next_charge_date, status)
  values (
    new.id,
    plan_display_name || ' Monthly Contribution',
    monthly_amount,
    'monthly',
    (current_date + interval '1 month')::date,
    'active'
  );

  insert into public.households (user_id, name, status, member_since)
  values (new.id, user_full_name || '''s Household', 'active', current_date)
  returning id into new_household_id;

  insert into public.family_members (
    user_id, household_id, full_name, relationship, role, status, is_primary, member_since
  )
  values (
    new.id,
    new_household_id,
    user_full_name,
    'Self',
    'Owner',
    'owner',
    true,
    current_date
  );

  insert into public.billing_contacts (user_id, full_name, email)
  values (new.id, user_full_name, new.email);

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.notifications (user_id, title, body, type)
  values (
    new.id,
    'Welcome to Chabad Bedford',
    'Your account and ' || plan_display_name || ' plan are ready.',
    'success'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
