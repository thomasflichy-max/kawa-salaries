-- Run this once in the Supabase SQL Editor, after 0001-0028.
--
-- Logs every employee signup attempt from app/actions/auth.ts (signup), so
-- staff can see in /admin/inscriptions who successfully created an account
-- and who tried with an email whose domain isn't recognized as a client
-- company (typo, or a genuine new company KAWA doesn't have set up yet).
-- Deliberately does NOT log trivial format-validation failures (invalid
-- email shape, too-short password) — no actionable signal there, just
-- clutter. Admin-only staff signups (adminSignup) aren't logged here either
-- — this table is about the employee-facing flow specifically.

create table public.signup_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  domain text not null,
  organization_id uuid references public.organizations(id) on delete set null,
  success boolean not null,
  reason text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.signup_attempts enable row level security;

drop policy if exists "kawa staff can read signup attempts" on public.signup_attempts;
create policy "kawa staff can read signup attempts"
  on public.signup_attempts for select
  using (public.is_kawa_staff());

-- The person signing up isn't authenticated yet (that's the whole point of
-- this table), so the insert has to be open — same trust level as the
-- signup form itself, and there's nothing sensitive to read back out
-- (select stays staff-only above).
drop policy if exists "anyone can log a signup attempt" on public.signup_attempts;
create policy "anyone can log a signup attempt"
  on public.signup_attempts for insert
  with check (true);
