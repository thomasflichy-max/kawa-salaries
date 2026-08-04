-- Explicit flavor tags for the "Choisir son café" guide, replacing the
-- earlier approach of scanning free-text descriptions for keywords — that
-- broke down once specific café-to-flavor associations were wanted (e.g.
-- "Rosa Blend" under both Corsé and Intense) without also awkwardly
-- stuffing/avoiding those exact words in the human-facing description.
alter table public.products
  add column if not exists flavor_tags text[] not null default '{}';
