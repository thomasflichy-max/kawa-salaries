-- Run this once in the Supabase SQL Editor, after 0001-0006.

alter table public.products
  add column if not exists sort_order integer not null default 0,
  add column if not exists hover_image_url text;
