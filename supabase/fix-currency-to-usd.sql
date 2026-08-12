-- =============================================================================
-- Fix: replace INR/₹ with USD/$ in existing database rows
-- Run this once in the Supabase SQL Editor
-- =============================================================================

-- Currency columns
update public.membership_plans set currency = 'USD' where currency is distinct from 'USD';
update public.billing_rules set currency = 'USD' where currency is distinct from 'USD';

update public.membership_billing_records
set currency = 'USD'
where currency is distinct from 'USD';

update public.membership_transactions
set currency = 'USD'
where currency is distinct from 'USD';

-- Notification / message text that still shows the old rupee symbol
update public.notifications
set body = replace(replace(body, '₹', '$'), 'INR', 'USD')
where body like '%₹%' or body like '%INR%';

update public.notifications
set title = replace(replace(title, '₹', '$'), 'INR', 'USD')
where title like '%₹%' or title like '%INR%';
