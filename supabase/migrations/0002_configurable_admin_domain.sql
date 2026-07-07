-- Run this once in the Supabase SQL Editor, after 0001_auth_and_rls.sql.
-- Makes the "who is kawa staff" domain configurable without redefining the
-- function, mirroring the KAWA_ADMIN_EMAIL_DOMAIN env var used by the app.

create or replace function public.is_kawa_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (auth.jwt() ->> 'email') ilike '%@' || coalesce(current_setting('app.admin_email_domain', true), 'kawa.coffee'),
    false
  );
$$;

-- To change the admin domain later (e.g. after a rebrand), run just this,
-- no redeploy needed:
-- alter database postgres set app.admin_email_domain = 'tanat.coffee';
