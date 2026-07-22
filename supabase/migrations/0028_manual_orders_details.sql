-- Run this once in the Supabase SQL Editor, after 0001-0027.
--
-- Extends manual_orders (0027) with fields needed when staff create an order
-- by hand from /admin/commandes/nouvelle: the actual order date (distinct
-- from created_at, which stays the true row-insertion timestamp used for
-- order_number numbering), a free-text internal comment, and how the
-- employee is expected to pay.

alter table public.manual_orders
  add column if not exists order_date timestamptz not null default timezone('utc', now()),
  add column if not exists comment text,
  add column if not exists payment_method text not null default 'lien_cb'
    check (payment_method in ('virement', 'lien_cb', 'boutique'));
