-- Run this once in the Supabase SQL Editor, after 0001-0018.
--
-- A company can have several delivery sites (HQ, other agencies) — the
-- salarié picks between "Retrait KAWA Nantes" and one of these at checkout.
-- Superseses organizations.delivery_address (kept, but no longer written to
-- or read by the app — see kawa_legal_invoicing memory note on why we leave
-- superseded columns in place instead of dropping them).

create table if not exists public.organization_addresses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  label text not null,
  address text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.organization_addresses enable row level security;

drop policy if exists "kawa staff can manage organization addresses" on public.organization_addresses;
create policy "kawa staff can manage organization addresses"
  on public.organization_addresses for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "users can read own organization addresses" on public.organization_addresses;
create policy "users can read own organization addresses"
  on public.organization_addresses for select
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

-- Carry over any existing single delivery_address as each org's first site,
-- so nothing is lost for orgs already onboarded before this table existed.
insert into public.organization_addresses (organization_id, label, address)
select id, 'Site principal', delivery_address
from public.organizations
where delivery_address is not null and trim(delivery_address) <> '';
