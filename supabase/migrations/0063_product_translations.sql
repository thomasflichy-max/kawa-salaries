-- Run this once in the Supabase SQL Editor, after 0001-0062.
--
-- Adds English columns to `products` for the new employee-space English
-- toggle (nullable — falls back to the French value when empty, so a new
-- product with no English text yet never shows blank). Pre-fills faithful
-- English translations of the current catalog so English mode isn't empty
-- on day one; staff can edit them going forward from the product form in
-- /admin/produits, same as the French fields.

alter table public.products
  add column if not exists name_en text,
  add column if not exists short_description_en text,
  add column if not exists description_en text;

update public.products set
  name_en = 'Bean-to-cup machine maintenance service',
  description_en = 'Maintenance for your automatic bean-to-cup machine — we carry out a descaling along with an interior and exterior cleaning of the machine. First contact via the form.'
where id = '110b0f5a-adf4-460f-9072-63e687bc89d9';

update public.products set
  name_en = 'Durgol Descaler – 125 ml (x2)',
  description_en = 'This Durgol descaler lets you effectively descale any of your coffee machines.'
where id = '2722e29a-7402-4205-8c2c-565e5549c43b';

update public.products set
  name_en = 'Delonghi filter',
  description_en = '1 filter for your Delonghi machine. Filtering the water helps limit limescale build-up in your machine while guaranteeing a pure taste.'
where id = 'f8fce8e0-c483-418e-a42b-bcfac5a2f63c';

update public.products set
  name_en = 'Delonghi FEB3535.SB — refurbished',
  description_en = e'Refurbished Delonghi FEB3535.SB coffee machine, all key parts have been replaced. Ideal for personal use or small offices.\n12-month warranty.'
where id = '9f6c0677-6890-4939-852c-0767da5c0bd1';

update public.products set
  name_en = 'Black Tea Dammann Frères - Breakfast – 50 bags',
  short_description_en = 'Black tea - Dammann Frères',
  description_en = e'Breakfast tea was born from the meeting of Ceylon, Darjeeling and Assam teas. The result is a brisk, invigorating cup that shines even more with a splash of milk.\n\nRecommended brewing time: 4-5 min\nRecommended water temperature: 90°C'
where id = 'abe8fbff-b347-40a4-a5dc-8d02e147481c';

update public.products set
  name_en = 'Black Tea Dammann Frères - Darjeeling – 50 bags',
  short_description_en = 'Black tea - Dammann Frères',
  description_en = e'Darjeeling tea, often called the champagne of black teas. This tea is light and well-balanced, and can be enjoyed at any time of day. In the cup, it''s amber-coloured with delicate notes of ripe peach.\n\nRecommended brewing time: 3-5 min\nRecommended water temperature: 90°C'
where id = '21ead0f3-5fcc-4b81-92c4-dddc39b28d5a';

update public.products set
  name_en = 'Black Tea Dammann Frères - Earl Grey Yin Zhen – 50 bags',
  short_description_en = 'Black tea - Dammann Frères',
  description_en = e'Timeless and always delicious, the flavour of bergamot blends with a black tea enriched with beautiful downy buds for elegance and a few flower petals for the eyes'' pleasure.\nA superb Earl Grey to enjoy without restraint whenever teatime calls!\n\nRecommended brewing time: 4-5 min\nRecommended water temperature: 90°C'
where id = 'eadb86a7-2e32-426d-9de7-76af4af14047';

update public.products set
  name_en = 'Bean-to-cup machine repair service',
  description_en = e'Quote-based — the fee covers fault diagnosis.\nWe then send you a quote detailing the parts to be replaced. First contact via the form.\n\nMachines we service:\n- Delonghi Magnifica\n- Delonghi Dinamica\n- Jura professional range'
where id = '368b460f-0765-423a-9deb-8465baac858a';

update public.products set
  name_en = 'Blend KAWA',
  short_description_en = 'Our signature blend and best-seller.',
  description_en = 'A blend of coffees from Guatemala, Brazil and Honduras, balanced and naturally sweet. Works just as well as an espresso or filter coffee, where it reveals even more chocolatey aromas.'
where id = 'a1ba34cc-cf3c-4b49-87a0-3c955bc30844';

update public.products set
  name_en = 'Mamma Mia',
  short_description_en = 'Travel to the heart of Italy with this intense coffee.',
  description_en = e'A so-called "Italian-style" blend, intense and powerful, with bold notes. Perfect for a trip to the heart of Italy, the time of one espresso.'
where id = '85f6b2db-a62c-42c4-a0e3-e3794ab5ace6';

update public.products set
  name_en = 'Brazil — Boa Esperança',
  short_description_en = 'The smoothness of Brazilian coffees and notes of hazelnut.',
  description_en = e'A Brazilian coffee with a round, balanced profile, perfect for fans of smooth espresso with delicate hazelnut notes. Well-controlled acidity and a lovely sweetness, for an indulgent, comforting cup.'
where id = '97fda57c-6b92-4d4b-bfb4-6cd23f30dc2b';

update public.products set
  name_en = 'Espresso Blend',
  short_description_en = 'An organic blend for espresso lovers.',
  description_en = 'An organic blend of Catuaí, Caturra and Typica varieties, grown at altitude in Guatemala and Honduras. A balanced espresso between power and finesse, with lovely dark chocolate notes and a round texture that coats the palate. Low acidity, for an indulgent, approachable cup.'
where id = '7a7145b8-13dd-413e-9f20-2934259b447b';

update public.products set
  name_en = 'Rosa Blend',
  short_description_en = 'Our organic blend, direct from the farms.',
  description_en = 'A blend of arabica and robusta from Guatemala, Honduras, India and El Salvador, for fans of bold, Italian-style espresso. Intense dark chocolate notes and good body, ideal in an automatic machine or a Bialetti moka pot.'
where id = '7bddc570-acde-4cb9-9ffe-12b90da5cef6';

update public.products set
  name_en = 'Blend 189',
  short_description_en = 'Our exclusive blend, an exceptional selection for discerning coffee lovers.',
  description_en = 'An organic blend of coffees from Brazil and Honduras, designed for espresso. In the cup: round, low acidity, with lovely indulgent notes of caramel and hazelnut. An approachable, indulgent, certified organic profile, for simple everyday pleasure.'
where id = 'c705481c-bd8e-48c2-96ef-1dea4ccf0baa';

update public.products set
  name_en = 'Guatemala — Todosantarita',
  short_description_en = 'A complex coffee with dark chocolate notes.',
  description_en = 'A Guatemalan coffee with deep dark chocolate notes, lifted by subtle tangy touches of red berries. An indulgent, complex espresso, sourced from a long-standing partner cooperative.'
where id = 'adcd186a-5259-4810-9afc-b6d0c0a94b5f';

update public.products set
  name_en = 'Ethiopia — Moka Lekempti',
  short_description_en = 'A rich, floral, slightly spiced coffee.',
  description_en = 'An Ethiopian espresso chosen for its spiced, lemony profile, lightly floral. An authentic expression of Ethiopian terroir, naturally processed in the traditional way. Also shines in a Bialetti moka pot, or as a filter coffee for a less tangy cup.'
where id = '312975f4-b2cd-45c6-9cd2-175e5e223a1d';

update public.products set
  name_en = 'Déca KAWA',
  short_description_en = 'A round, indulgent decaf coffee, with no compromise on flavour.',
  description_en = 'A naturally decaffeinated coffee from Chiapas, Mexico — the caffeine is removed by simply soaking the beans in water, preserving all the aromas. In the cup: a balanced coffee, with notes of chocolate and caramel, no compromise on flavour.'
where id = '4593322b-2a60-45a9-979b-7a7a938c1ac6';
