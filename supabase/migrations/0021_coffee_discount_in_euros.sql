-- Run this once in the Supabase SQL Editor, after 0001-0020.
--
-- Coffee discounts are now a flat € amount off the base price, not a %.

alter table public.organization_coffee_discounts
  rename column discount_rate to discount_amount;

-- Convert existing values (still holding the old % figures) into € amounts,
-- so already-configured orgs keep the same effective price.
update public.organization_coffee_discounts ocd
set discount_amount = round(cp.base_price * ocd.discount_amount / 100, 2)
from public.coffee_pricing cp
where cp.subcategory = ocd.subcategory;
