-- Run this once in the Supabase SQL Editor, after 0001 and 0002.

-- One organization per email domain — find_organization_by_domain() relies on
-- this (it does `limit 1`, which would otherwise pick an arbitrary row).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'organizations_domain_key'
  ) then
    alter table public.organizations
      add constraint organizations_domain_key unique (domain);
  end if;
end $$;

-- Let kawa staff create and edit client organizations from /admin.
drop policy if exists "kawa staff can insert organizations" on public.organizations;
create policy "kawa staff can insert organizations"
  on public.organizations for insert
  with check (public.is_kawa_staff());

drop policy if exists "kawa staff can update organizations" on public.organizations;
create policy "kawa staff can update organizations"
  on public.organizations for update
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());
