-- =============================================================================
-- DEMO DATA for ali@gamil.com
-- =============================================================================
-- BEFORE RUNNING:
--   1. Run supabase/schema.sql (if tables don't exist)
--   2. Create account: sign up in the app with email ali@gamil.com
--      OR add user in Supabase → Authentication → Users
--   3. Run this entire script in Supabase SQL Editor
--
-- Safe to re-run: clears previous demo rows for this user, then re-inserts.
-- =============================================================================

-- Fix notification type constraint (older DBs may only allow info/success/warning)
alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('info', 'success', 'warning', 'household', 'payment', 'system'));

do $$
declare
  v_email text := 'ali@gamil.com';
  v_user_id uuid;
  v_household_id bigint;
begin
  select id into v_user_id
  from auth.users
  where lower(email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    raise exception 'No auth user found for %. Sign up first, then run this script again.', v_email;
  end if;

  -- -------------------------------------------------------------------------
  -- Profile
  -- -------------------------------------------------------------------------
  insert into public.profiles (
    id, full_name, first_name, last_name, email, mobile,
    address, city, state, zip, country, contact_preference,
    billing_portal_url, updated_at
  )
  values (
    v_user_id,
    'Ali Khan',
    'Ali',
    'Khan',
    v_email,
    '+91 98765 43210',
    '42 MG Road',
    'Mumbai',
    'Maharashtra',
    '400001',
    'India',
    'both',
    'https://billing.stripe.com/demo/ali-khan',
    now()
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    first_name = excluded.first_name,
    last_name = excluded.last_name,
    email = excluded.email,
    mobile = excluded.mobile,
    address = excluded.address,
    city = excluded.city,
    state = excluded.state,
    zip = excluded.zip,
    country = excluded.country,
    contact_preference = excluded.contact_preference,
    billing_portal_url = excluded.billing_portal_url,
    updated_at = now();

  -- -------------------------------------------------------------------------
  -- Membership (Standard plan)
  -- -------------------------------------------------------------------------
  delete from public.memberships where user_id = v_user_id;

  insert into public.memberships (
    user_id, plan_key, membership_name, status, annual_commitment,
    started_at, renewal_date, notes
  )
  values (
    v_user_id,
    'standard',
    'Standard Membership',
    'active',
    2400,
    '2024-01-15',
    '2026-01-15',
    'Thank you for being an active member of our community.'
  );

  -- -------------------------------------------------------------------------
  -- Household
  -- -------------------------------------------------------------------------
  delete from public.family_members where user_id = v_user_id;
  delete from public.household_members where user_id = v_user_id;
  delete from public.households where user_id = v_user_id;

  insert into public.households (
    user_id, name, address_line1, city, state, zip, country, status, member_since
  )
  values (
    v_user_id,
    'Khan Family',
    '42 MG Road',
    'Mumbai',
    'Maharashtra',
    '400001',
    'India',
    'active',
    '2024-01-15'
  )
  returning id into v_household_id;

  insert into public.family_members (
    user_id, household_id, full_name, relationship, role, status,
    date_of_birth, email, phone, is_primary, member_since
  )
  values
    (v_user_id, v_household_id, 'Ali Khan', 'Self', 'Owner', 'owner', '1988-03-12', v_email, '+91 98765 43210', true, '2024-01-15'),
    (v_user_id, v_household_id, 'Fatima Khan', 'Spouse', 'Member', 'member', '1990-07-22', 'fatima.khan@example.com', '+91 98765 43211', false, '2024-01-15'),
    (v_user_id, v_household_id, 'Omar Khan', 'Child', 'Member', 'member', '2012-11-05', null, null, false, '2024-01-15'),
    (v_user_id, v_household_id, 'Sara Khan', 'Child', 'Member', 'member', '2015-09-18', null, null, false, '2024-01-15');

  insert into public.household_members (
    user_id, household_id, full_name, relationship, role, status,
    date_of_birth, email, phone, is_primary, member_since
  )
  select
    user_id, household_id, full_name, relationship, role, status,
    date_of_birth, email, phone, is_primary, member_since
  from public.family_members
  where user_id = v_user_id;

  -- -------------------------------------------------------------------------
  -- Billing contact & settings
  -- -------------------------------------------------------------------------
  insert into public.billing_contacts (user_id, full_name, email, phone)
  values (v_user_id, 'Ali Khan', v_email, '+91 98765 43210')
  on conflict (user_id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    phone = excluded.phone;

  insert into public.user_settings (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  -- -------------------------------------------------------------------------
  -- Payment method
  -- -------------------------------------------------------------------------
  delete from public.payment_methods where user_id = v_user_id;

  insert into public.payment_methods (user_id, type, brand, last_four, is_primary, expires_at)
  values
    (v_user_id, 'card', 'Visa', '4242', true, '2028-12-01'),
    (v_user_id, 'card', 'Mastercard', '8210', false, '2027-06-01');

  -- -------------------------------------------------------------------------
  -- Recurring contribution
  -- -------------------------------------------------------------------------
  delete from public.recurring_contributions where user_id = v_user_id;

  insert into public.recurring_contributions (
    user_id, description, amount, frequency, next_charge_date, status
  )
  values (
    v_user_id,
    'Standard Membership Monthly Contribution',
    200,
    'monthly',
    (current_date + interval '12 days')::date,
    'active'
  );

  -- -------------------------------------------------------------------------
  -- Contributions (dues)
  -- -------------------------------------------------------------------------
  delete from public.contributions where user_id = v_user_id;

  insert into public.contributions (user_id, amount, status, contribution_type, due_date)
  values
    (v_user_id, 200, 'paid', 'monthly', current_date - interval '75 days'),
    (v_user_id, 200, 'paid', 'monthly', current_date - interval '45 days'),
    (v_user_id, 200, 'paid', 'monthly', current_date - interval '15 days'),
    (v_user_id, 200, 'pending', 'monthly', current_date + interval '15 days');

  -- -------------------------------------------------------------------------
  -- Payments (history)
  -- -------------------------------------------------------------------------
  delete from public.payments where user_id = v_user_id;

  insert into public.payments (
    user_id, amount, description, status, payment_method, payment_method_label,
    reference_number, contribution_type, paid_at
  )
  values
    (v_user_id, 200, 'Monthly Contribution', 'paid', 'card', 'Visa ending in 4242', 'TXN-ALI-2026-0001', 'monthly', now() - interval '75 days'),
    (v_user_id, 200, 'Monthly Contribution', 'paid', 'card', 'Visa ending in 4242', 'TXN-ALI-2026-0002', 'monthly', now() - interval '45 days'),
    (v_user_id, 200, 'Monthly Contribution', 'paid', 'upi', 'UPI • ali@gamil.com', 'TXN-ALI-2026-0003', 'monthly', now() - interval '15 days'),
    (v_user_id, 500, 'Community Event Donation', 'paid', 'card', 'Visa ending in 4242', 'TXN-ALI-2026-0004', 'one-time', now() - interval '8 days');

  -- -------------------------------------------------------------------------
  -- Notifications
  -- -------------------------------------------------------------------------
  delete from public.notifications where user_id = v_user_id;

  insert into public.notifications (user_id, title, body, type, is_read, created_at)
  values
    (v_user_id, 'Welcome to Chabad Bedford', 'Your Standard Membership is active. Explore your member portal.', 'success', true, now() - interval '30 days'),
    (v_user_id, 'Payment Received', 'We received your monthly contribution of ₹200. Thank you!', 'payment', true, now() - interval '15 days'),
    (v_user_id, 'Upcoming Contribution', 'Your next monthly contribution of ₹200 is due in 12 days.', 'info', false, now() - interval '2 days'),
    (v_user_id, 'Household Updated', 'Fatima Khan was added to your household.', 'household', true, now() - interval '20 days'),
    (v_user_id, 'Membership Renewal', 'Your membership renews on 15 Jan 2026.', 'system', false, now() - interval '1 day');

  raise notice 'Demo data loaded for % (user_id: %)', v_email, v_user_id;
end $$;

-- Verify demo data
select
  u.email,
  p.full_name,
  m.plan_key,
  m.annual_commitment,
  h.name as household_name,
  (select count(*) from public.family_members fm where fm.user_id = u.id) as family_members,
  (select count(*) from public.payments pay where pay.user_id = u.id) as payments,
  (select count(*) from public.notifications n where n.user_id = u.id and not n.is_read) as unread_notifications
from auth.users u
left join public.profiles p on p.id = u.id
left join public.memberships m on m.user_id = u.id
left join public.households h on h.user_id = u.id
where lower(u.email) = 'ali@gamil.com';
