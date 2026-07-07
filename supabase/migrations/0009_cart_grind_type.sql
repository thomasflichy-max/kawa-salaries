-- Run this once in the Supabase SQL Editor, after 0001-0008.
--
-- Coffee can be ground differently (grain/filtre/espresso); two cart lines
-- for the same coffee with different grinds must stay separate rows, but
-- non-coffee products (grind_type null) must still collapse into one row
-- per product like before — hence the coalesce() in the unique index below
-- instead of a plain UNIQUE(user_id, product_id, grind_type) constraint,
-- since SQL treats every NULL as distinct from every other NULL.

alter table public.cart_items
  add column if not exists grind_type text check (grind_type in ('grain', 'filtre', 'espresso'));

alter table public.cart_items
  drop constraint if exists cart_items_user_id_product_id_key;

create unique index if not exists cart_items_user_product_grind_key
  on public.cart_items (user_id, product_id, coalesce(grind_type, ''));
