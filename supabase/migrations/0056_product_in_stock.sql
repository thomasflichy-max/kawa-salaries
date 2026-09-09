-- Run this once in the Supabase SQL Editor, after 0001-0055.
--
-- "Rupture de stock" flag, separate from `active` (hidden entirely) and
-- `purchasable` (sold via the interest form). in_stock = false keeps the
-- product visible in the catalog but blocks ordering, with an
-- "En rupture de stock" badge.

alter table public.products
  add column if not exists in_stock boolean not null default true;
