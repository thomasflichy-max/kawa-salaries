-- Run this once in the Supabase SQL Editor, after 0001-0058.
--
-- Changes the allowed réassort cadences from (2, 4, 6, 8) weeks to
-- (4, 6, 8, 10, 12) weeks — see lib/subscription-frequency.ts. Reassign any
-- existing 2-week subscription to 4 weeks first so it still satisfies the
-- new check constraint.

update public.product_subscriptions
  set frequency_weeks = 4
  where frequency_weeks = 2;

alter table public.product_subscriptions
  drop constraint if exists product_subscriptions_frequency_weeks_check;

alter table public.product_subscriptions
  add constraint product_subscriptions_frequency_weeks_check
  check (frequency_weeks in (4, 6, 8, 10, 12));
