-- Run once in Supabase SQL Editor to charge TEST auto-pay every 2 minutes.
-- Requires extensions: pg_cron, pg_net (enable in Database → Extensions if needed).

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- Replace YOUR_CRON_SECRET with the value you set via:
-- npx supabase secrets set CRON_SECRET=your-random-secret-here

select cron.unschedule(jobid)
from cron.job
where jobname = 'process-test-autopay';

select cron.schedule(
  'process-test-autopay',
  '* * * * *',
  $$
  select net.http_post(
    url := 'https://bifcjbwvzpbfpfowxjkt.supabase.co/functions/v1/process-test-autopay',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'chabad-cron-test-2026'
    ),
    body := '{}'::jsonb
  );
  $$
);
