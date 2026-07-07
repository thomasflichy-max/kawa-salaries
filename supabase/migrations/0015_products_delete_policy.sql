-- Run this once in the Supabase SQL Editor, after 0001-0014.
-- The admin catalog UI added a "Supprimer" action for products, but no
-- DELETE policy existed on public.products (only select/insert/update).

drop policy if exists "kawa staff can delete products" on public.products;
create policy "kawa staff can delete products"
  on public.products for delete
  using (public.is_kawa_staff());
