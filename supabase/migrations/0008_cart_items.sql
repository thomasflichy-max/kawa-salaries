-- Run this once in the Supabase SQL Editor, after 0001-0007.

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

alter table public.cart_items enable row level security;

drop policy if exists "users manage own cart" on public.cart_items;
create policy "users manage own cart"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
