-- Run this once in the Supabase SQL Editor, after 0001-0004.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('cafe', 'entretien', 'machine')),
  name text not null,
  description text,
  price numeric not null,
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.products enable row level security;

-- Any signed-in employee can browse the active catalog.
drop policy if exists "authenticated users can read active products" on public.products;
create policy "authenticated users can read active products"
  on public.products for select
  using (auth.role() = 'authenticated' and active = true);

-- kawa staff manage the catalog (including inactive/draft products).
drop policy if exists "kawa staff can read all products" on public.products;
create policy "kawa staff can read all products"
  on public.products for select
  using (public.is_kawa_staff());

drop policy if exists "kawa staff can insert products" on public.products;
create policy "kawa staff can insert products"
  on public.products for insert
  with check (public.is_kawa_staff());

drop policy if exists "kawa staff can update products" on public.products;
create policy "kawa staff can update products"
  on public.products for update
  using (public.is_kawa_staff())
  with check (public.is_kawa_staff());
