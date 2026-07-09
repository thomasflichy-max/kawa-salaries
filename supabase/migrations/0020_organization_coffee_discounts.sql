-- Run this once in the Supabase SQL Editor, after 0001-0019.
--
-- Each client company can negotiate a different discount per coffee
-- subcategory (classique/bio/decafeine), instead of one flat rate for all
-- coffee. Supersedes organizations.discount_rate (kept, unused going
-- forward — same reasoning as coffee_pricing.discount_percent earlier).

create table if not exists public.organization_coffee_discounts (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  subcategory text not null check (subcategory in ('classique', 'bio', 'decafeine')),
  discount_rate numeric not null default 0,
  primary key (organization_id, subcategory)
);

alter table public.organization_coffee_discounts enable row level security;

drop policy if exists "kawa staff can manage organization coffee discounts" on public.organization_coffee_discounts;
create policy "kawa staff can manage organization coffee discounts"
  on public.organization_coffee_discounts for all
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());

drop policy if exists "users can read own organization coffee discounts" on public.organization_coffee_discounts;
create policy "users can read own organization coffee discounts"
  on public.organization_coffee_discounts for select
  using (
    organization_id in (
      select organization_id from public.profiles where id = auth.uid()
    )
  );

-- Backfill: every existing org's old flat discount_rate becomes its rate
-- for all 3 subcategories, so nobody's price changes the moment this ships.
insert into public.organization_coffee_discounts (organization_id, subcategory, discount_rate)
select o.id, s.subcategory, coalesce(o.discount_rate, 0)
from public.organizations o
cross join (values ('classique'), ('bio'), ('decafeine')) as s(subcategory)
on conflict (organization_id, subcategory) do nothing;
