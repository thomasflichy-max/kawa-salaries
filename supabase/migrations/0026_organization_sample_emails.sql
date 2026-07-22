-- Run this once in the Supabase SQL Editor, after 0001-0025.
--
-- A company can have several "mail type" examples (different naming
-- conventions across departments/sites), same need that motivated
-- organization_addresses for delivery sites — so this follows that table's
-- exact shape and RLS. Supersedes organizations.sample_email (kept, but no
-- longer written to or read by the app — see kawa_legal_invoicing memory
-- note on why we leave superseded columns in place instead of dropping them).

create table if not exists public.organization_sample_emails (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.organization_sample_emails enable row level security;

drop policy if exists "kawa staff can manage organization sample emails" on public.organization_sample_emails;
create policy "kawa staff can manage organization sample emails"
  on public.organization_sample_emails for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "users can read own organization sample emails" on public.organization_sample_emails;
create policy "users can read own organization sample emails"
  on public.organization_sample_emails for select
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

-- Carry over any existing single sample_email as each org's first entry, so
-- nothing is lost for orgs already onboarded before this table existed.
insert into public.organization_sample_emails (organization_id, email)
select id, sample_email
from public.organizations
where sample_email is not null and trim(sample_email) <> '';
