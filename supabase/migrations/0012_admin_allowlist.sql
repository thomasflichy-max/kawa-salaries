-- Run this once in the Supabase SQL Editor, after 0001-0011.
--
-- Admin access moves from "anyone @kawa.coffee" to an explicit allowlist of
-- 3 people, mirroring the KAWA_ADMIN_EMAILS env var used by the app.

create or replace function public.is_kawa_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    lower(auth.jwt() ->> 'email') = any (
      string_to_array(
        lower(coalesce(
          current_setting('app.admin_emails', true),
          'thomas.flichy@kawa.coffee,brieuc@kawa.coffee,jean@kawa.coffee'
        )),
        ','
      )
    ),
    false
  );
$$;

-- To change the admin list later, run just this, no redeploy needed:
-- alter database postgres set app.admin_emails = 'thomas.flichy@kawa.coffee,brieuc@kawa.coffee,jean@kawa.coffee,nouvelle.personne@kawa.coffee';
