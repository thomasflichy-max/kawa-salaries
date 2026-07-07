-- Run this once in the Supabase SQL Editor, after 0001-0003.
-- Employees need to read their own company's name/discount_rate on /compte,
-- but organizations only had a "kawa staff can read" policy so far — every
-- other authenticated user was silently blocked by RLS (no error, just an
-- empty result), which is why /compte showed "—" despite profiles.organization_id
-- being set correctly.

drop policy if exists "users can read own organization" on public.organizations;
create policy "users can read own organization"
  on public.organizations for select
  using (
    id in (select organization_id from public.profiles where id = auth.uid())
  );
