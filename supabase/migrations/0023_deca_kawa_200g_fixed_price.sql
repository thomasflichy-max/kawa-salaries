-- Run this once in the Supabase SQL Editor, after 0001-0022.
--
-- Coffee is sold in 1kg bags by default (net_weight_grams default 1000).
-- Déca KAWA is the one exception: a smaller 200g bag at a fixed price set
-- directly (9,90€) instead of following the shared per-kg décaféiné pricing
-- rule — it's detached from `coffee_pricing` by clearing its subcategory.

alter table public.products add column if not exists net_weight_grams integer not null default 1000;

update public.products
set subcategory = null, price = 9.90, net_weight_grams = 200
where name = 'Déca KAWA';
