-- Run this once in the Supabase SQL Editor, after 0001-0005.
--
-- Coffee pricing model: every coffee has a fixed base price (31.90€), and the
-- actual selling price is base_price * (1 - discount_percent/100), where the
-- discount_percent is set per subcategory (classique/bio), not per product or
-- per organization. Changing one number here re-prices every coffee in that
-- subcategory at once. This price is what every employee pays, regardless of
-- their company's organizations.discount_rate (which does not apply to coffee).

alter table public.products
  add column if not exists subcategory text,
  add column if not exists tag text;

alter table public.products
  alter column price drop not null;

create table if not exists public.coffee_pricing (
  subcategory text primary key check (subcategory in ('classique', 'bio')),
  base_price numeric not null default 31.90,
  discount_percent numeric not null default 0
);

insert into public.coffee_pricing (subcategory, base_price, discount_percent)
values ('classique', 31.90, 17), ('bio', 31.90, 16)
on conflict (subcategory) do nothing;

alter table public.coffee_pricing enable row level security;

drop policy if exists "authenticated users can read coffee pricing" on public.coffee_pricing;
create policy "authenticated users can read coffee pricing"
  on public.coffee_pricing for select
  using (auth.role() = 'authenticated');

drop policy if exists "kawa staff can update coffee pricing" on public.coffee_pricing;
create policy "kawa staff can update coffee pricing"
  on public.coffee_pricing for update
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());
