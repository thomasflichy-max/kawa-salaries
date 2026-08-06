-- Employee support questions (app/actions/support.ts) used to only land in
-- support_messages, which no admin page ever read — the only way to see one
-- was a direct SQL query, even though it emailed staff immediately. Folding
-- them into security_events instead puts them in the same channel already
-- used for security alerts (renamed "Sécurité & support" on the admin side),
-- so both real messages and threats live in one place with one unread badge.
--
-- Backfill existing history first, preserving original timestamps so old
-- messages land in their real day-group instead of bunching under "today".
insert into public.security_events (event_type, email, detail, created_at)
select
  'support_message',
  coalesce(p.email, u.email),
  sm.message,
  sm.created_at
from public.support_messages sm
left join public.profiles p on p.id = sm.user_id
left join auth.users u on u.id = sm.user_id;

-- support_messages itself is left in place (not dropped) as a historical
-- record — app/actions/support.ts stops writing to it going forward in
-- favor of security_events directly.
