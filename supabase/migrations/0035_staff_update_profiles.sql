-- "users update own profile" (0001) only allows auth.uid() = id — staff has
-- never had a way to update another employee's profile row. suspendEmployee
-- (app/admin/actions.ts) silently affected 0 rows because of this: RLS
-- filters the row out before the trigger even runs, and Supabase's
-- `.update()` doesn't error on a 0-row match, so the UI reported success
-- with nothing actually changed in the DB.
--
-- Multiple permissive policies for the same command are OR'd together by
-- Postgres, so this purely adds a staff-only escape hatch — the existing
-- "auth.uid() = id" policy still applies unchanged for employees.

drop policy if exists "staff can update any profile" on public.profiles;
create policy "staff can update any profile"
  on public.profiles for update
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());
