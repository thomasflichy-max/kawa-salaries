-- Run this once in the Supabase SQL Editor, after 0001-0048.
--
-- A single client entity can have staff on more than one email domain — e.g.
-- a group that kept both domains after a merger (ALTAVIA: altavia-france.com
-- and altavia-nantes.com). Until now the model was strictly one org per
-- domain (organizations_domain_key unique constraint), which forced creating
-- two separate organizations — split salarié list, split invoicing.
--
-- organizations.domain stays the primary/canonical domain (still unique,
-- still what's shown and used as the default for mail-type validation). This
-- table holds any *additional* domains that should resolve to the same org
-- at signup.

create table if not exists public.organization_domains (
  domain text primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists organization_domains_organization_id_idx
  on public.organization_domains (organization_id);

alter table public.organization_domains enable row level security;

drop policy if exists "kawa staff can manage organization domains" on public.organization_domains;
create policy "kawa staff can manage organization domains"
  on public.organization_domains for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

-- A domain must be globally unique: the primary key covers this table, and
-- this trigger stops an additional domain from shadowing another org's
-- primary domain (find_organization_by_domain does `limit 1` and would
-- otherwise pick arbitrarily).
create or replace function public.organization_domains_no_primary_collision()
returns trigger
language plpgsql
as $$
begin
  if exists (
    select 1 from public.organizations o
    where lower(o.domain) = lower(new.domain)
  ) then
    raise exception 'Le domaine % est déjà le domaine principal d''une entreprise.', new.domain
      using errcode = 'unique_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists organization_domains_no_primary_collision on public.organization_domains;
create trigger organization_domains_no_primary_collision
  before insert or update on public.organization_domains
  for each row execute function public.organization_domains_no_primary_collision();

-- Extend the signup lookup to also match an org's additional domains.
create or replace function public.find_organization_by_domain(input_domain text)
returns table (id uuid, name text)
language sql
security definer
set search_path = public
stable
as $$
  select o.id, o.name
  from public.organizations o
  where o.active = true
    and (
      lower(o.domain) = lower(input_domain)
      or exists (
        select 1
        from public.organization_domains d
        where d.organization_id = o.id
          and lower(d.domain) = lower(input_domain)
      )
    )
  limit 1;
$$;
