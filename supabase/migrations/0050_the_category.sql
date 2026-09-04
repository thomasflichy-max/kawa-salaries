-- Run this once in the Supabase SQL Editor, after 0001-0049.
--
-- New "Thés" product category, alongside cafe/entretien/machine — see
-- lib/product-categories.ts. Same pattern as 0017_decaf_subcategory.sql for
-- widening a check constraint.

alter table public.products drop constraint if exists products_category_check;
alter table public.products add constraint products_category_check
  check (category in ('cafe', 'the', 'entretien', 'machine'));
