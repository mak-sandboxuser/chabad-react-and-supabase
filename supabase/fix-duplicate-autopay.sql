-- Clean up duplicate active auto-pay rows (keep newest only per user).
-- Run in Supabase SQL Editor.

with ranked as (
  select
    id,
    user_id,
    row_number() over (
      partition by user_id
      order by created_at desc nulls last, id desc
    ) as rn
  from public.recurring_contributions
  where status = 'active'
)
update public.recurring_contributions rc
set status = 'cancelled'
from ranked r
where rc.id = r.id
  and r.rn > 1;

-- Verify: each user should have at most 1 active row
select user_id, count(*) as active_count
from public.recurring_contributions
where status = 'active'
group by user_id
having count(*) > 1;
