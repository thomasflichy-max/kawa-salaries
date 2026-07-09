-- Run this once in the Supabase SQL Editor, after 0001-0016.
--
-- Adds a third coffee subcategory (décaféiné, base price 34,90€) and the
-- "Déca KAWA" product using the existing deca-300/deca-600 image assets.

alter table public.coffee_pricing drop constraint if exists coffee_pricing_subcategory_check;
alter table public.coffee_pricing add constraint coffee_pricing_subcategory_check
  check (subcategory in ('classique', 'bio', 'decafeine'));

insert into public.coffee_pricing (subcategory, base_price)
values ('decafeine', 34.90)
on conflict (subcategory) do update set base_price = excluded.base_price;

insert into public.products (
  category, subcategory, name, description, image_url, hover_image_url, purchasable, active
)
values (
  'cafe',
  'decafeine',
  'Déca KAWA',
  'Un café décaféiné rond et gourmand, sans compromis sur le goût.',
  '/products/cafes/deca-300.jpg',
  '/products/cafes/deca-600.jpg',
  true,
  true
);
