-- Run this file in Supabase SQL Editor.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.memberships (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_key text not null check (plan_key in ('basic', 'standard', 'premium')),
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled', 'pending')),
  annual_commitment numeric(12,2) not null default 0,
  started_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.contributions (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed')),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  description text,
  status text not null default 'paid' check (status in ('paid', 'pending', 'failed', 'refunded')),
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'Member',
  status text not null default 'member',
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'info' check (type in ('info', 'success', 'warning', 'household')),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.contributions enable row level security;
alter table public.payments enable row level security;
alter table public.household_members enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles_own_rows" on public.profiles;
create policy "profiles_own_rows" on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "memberships_own_rows" on public.memberships;
create policy "memberships_own_rows" on public.memberships
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "contributions_own_rows" on public.contributions;
create policy "contributions_own_rows" on public.contributions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "payments_own_rows" on public.payments;
create policy "payments_own_rows" on public.payments
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "household_members_own_rows" on public.household_members;
create policy "household_members_own_rows" on public.household_members
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "notifications_own_rows" on public.notifications;
create policy "notifications_own_rows" on public.notifications
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_plan text := lower(coalesce(new.raw_user_meta_data ->> 'membership_plan', 'basic'));
  selected_commitment numeric(12,2);
begin
  if selected_plan not in ('basic', 'standard', 'premium') then
    selected_plan := 'basic';
  end if;

  selected_commitment := case selected_plan
    when 'basic' then 999
    when 'standard' then 2499
    when 'premium' then 4999
    else 999
  end;

  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.memberships (user_id, plan_key, status, annual_commitment)
  values (new.id, selected_plan, 'active', selected_commitment)
  on conflict do nothing;

  insert into public.household_members (user_id, full_name, role, status, is_primary)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'Primary Member',
    'owner',
    true
  );

  insert into public.notifications (user_id, title, body, type)
  values (
    new.id,
    'Welcome to Chabad Bedford',
    'Your account and membership plan are ready.',
    'success'
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
