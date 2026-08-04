-- Separates the short blurb shown on the products grid from the longer,
-- detailed description shown on a product's own page — previously both
-- were the same `description` column, so making the detail page richer
-- (real tasting notes) made every grid card noticeably longer/busier too.
alter table public.products
  add column if not exists short_description text;
