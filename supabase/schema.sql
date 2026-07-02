-- Run this entire file in Supabase SQL Editor.
-- Creates all tables needed for every page in the member portal.

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  first_name text,
  last_name text,
  email text,
  mobile text,
  address text,
  city text,
  state text,
  zip text,
  country text default 'India',
  contact_preference text default 'email' check (contact_preference in ('email', 'sms', 'both')),
  stripe_customer_id text,
  billing_portal_url text,
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists mobile text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists city text;
alter table public.profiles add column if not exists state text;
alter table public.profiles add column if not exists zip text;
alter table public.profiles add column if not exists country text default 'India';
alter table public.profiles add column if not exists contact_preference text default 'email';
alter table public.profiles add column if not exists stripe_customer_id text;
alter table public.profiles add column if not exists billing_portal_url text;
alter table public.profiles add column if not exists last_sign_in_at timestamptz;

-- ============================================================
-- HOUSEHOLDS
-- ============================================================
create table if not exists public.households (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address_line1 text,
  city text,
  state text,
  zip text,
  country text default 'India',
  status text not null default 'active',
  member_since date not null default current_date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- MEMBERSHIPS
-- ============================================================
create table if not exists public.memberships (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_key text not null check (plan_key in ('basic', 'standard', 'premium')),
  membership_name text,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled', 'pending')),
  annual_commitment numeric(12,2) not null default 0,
  started_at date not null default current_date,
  renewal_date date,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.memberships add column if not exists membership_name text;
alter table public.memberships add column if not exists renewal_date date;
alter table public.memberships add column if not exists notes text;

-- ============================================================
-- FAMILY MEMBERS (connected to auth.users)
-- ============================================================
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

-- Legacy table kept for backward compatibility (optional)
create table if not exists public.household_members (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  household_id bigint references public.households(id) on delete cascade,
  full_name text not null,
  relationship text default 'Self',
  role text not null default 'Member',
  status text not null default 'member',
  date_of_birth date,
  email text,
  phone text,
  preferred_contact text default 'email',
  mailing_address text,
  is_primary boolean not null default false,
  member_since date,
  created_at timestamptz not null default now()
);

alter table public.household_members add column if not exists household_id bigint references public.households(id) on delete cascade;
alter table public.household_members add column if not exists relationship text default 'Self';
alter table public.household_members add column if not exists date_of_birth date;
alter table public.household_members add column if not exists email text;
alter table public.household_members add column if not exists phone text;
alter table public.household_members add column if not exists preferred_contact text default 'email';
alter table public.household_members add column if not exists mailing_address text;
alter table public.household_members add column if not exists member_since date;

-- ============================================================
-- CONTRIBUTIONS
-- ============================================================
create table if not exists public.contributions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  contribution_type text default 'monthly',
  due_date date,
  created_at timestamptz not null default now()
);

alter table public.contributions add column if not exists contribution_type text default 'monthly';

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  status text not null default 'paid' check (status in ('paid', 'pending', 'failed', 'refunded')),
  payment_method text default 'card',
  payment_method_label text,
  reference_number text,
  contribution_type text default 'monthly',
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.payments add column if not exists payment_method text default 'card';
alter table public.payments add column if not exists payment_method_label text;
alter table public.payments add column if not exists reference_number text;
alter table public.payments add column if not exists contribution_type text default 'monthly';

-- ============================================================
-- RECURRING CONTRIBUTIONS
-- ============================================================
create table if not exists public.recurring_contributions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(12,2) not null check (amount >= 0),
  frequency text not null default 'monthly',
  next_charge_date date,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- PAYMENT METHODS
-- ============================================================
create table if not exists public.payment_methods (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'card' check (type in ('card', 'bank', 'ach')),
  brand text,
  last_four text,
  is_primary boolean not null default false,
  expires_at date,
  created_at timestamptz not null default now()
);

-- ============================================================
-- BILLING CONTACTS
-- ============================================================
create table if not exists public.billing_contacts (
  id bigserial primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'household', 'payment', 'system')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- USER SETTINGS
-- ============================================================
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  notification_email boolean not null default true,
  notification_sms boolean not null default false,
  notification_in_app boolean not null default true,
  marketing_email boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SUPPORT CONFIG (org-wide, readable by all authenticated users)
-- ============================================================
create table if not exists public.support_config (
  id int primary key default 1 check (id = 1),
  org_email text,
  support_email text,
  phone text,
  hours text,
  faq_url text,
  updated_at timestamptz not null default now()
);

insert into public.support_config (id, org_email, support_email, phone, hours, faq_url)
values (
  1,
  'info@chabadbedford.org',
  'support@chabadbedford.org',
  '+1 (123) 456-7890',
  'Mon–Fri 9:00 AM – 5:00 PM EST',
  '#'
)
on conflict (id) do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.family_members enable row level security;
alter table public.households enable row level security;
alter table public.memberships enable row level security;
alter table public.household_members enable row level security;
alter table public.contributions enable row level security;
alter table public.payments enable row level security;
alter table public.recurring_contributions enable row level security;
alter table public.payment_methods enable row level security;
alter table public.billing_contacts enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;
alter table public.support_config enable row level security;

drop policy if exists "profiles_own_rows" on public.profiles;
create policy "profiles_own_rows" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "family_members_own_rows" on public.family_members;
create policy "family_members_own_rows" on public.family_members
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "households_own_rows" on public.households;
create policy "households_own_rows" on public.households
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "memberships_own_rows" on public.memberships;
create policy "memberships_own_rows" on public.memberships
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "household_members_own_rows" on public.household_members;
create policy "household_members_own_rows" on public.household_members
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "contributions_own_rows" on public.contributions;
create policy "contributions_own_rows" on public.contributions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "payments_own_rows" on public.payments;
create policy "payments_own_rows" on public.payments
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "recurring_contributions_own_rows" on public.recurring_contributions;
create policy "recurring_contributions_own_rows" on public.recurring_contributions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "payment_methods_own_rows" on public.payment_methods;
create policy "payment_methods_own_rows" on public.payment_methods
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "billing_contacts_own_rows" on public.billing_contacts;
create policy "billing_contacts_own_rows" on public.billing_contacts
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notifications_own_rows" on public.notifications;
create policy "notifications_own_rows" on public.notifications
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "user_settings_own_rows" on public.user_settings;
create policy "user_settings_own_rows" on public.user_settings
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "support_config_read" on public.support_config;
create policy "support_config_read" on public.support_config
for select using (auth.role() = 'authenticated');

-- ============================================================
-- SIGNUP TRIGGER — auto-create all related records
-- ============================================================
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

  insert into public.household_members (
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
