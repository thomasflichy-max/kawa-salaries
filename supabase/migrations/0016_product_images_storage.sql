-- Run this once in the Supabase SQL Editor, after 0001-0015.
--
-- Storage bucket for product images uploaded from the admin catalog (instead
-- of pasting a URL to a file already committed under /public).

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "anyone can view product images" on storage.objects;
create policy "anyone can view product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

drop policy if exists "kawa staff can upload product images" on storage.objects;
create policy "kawa staff can upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_kawa_staff());

drop policy if exists "kawa staff can update product images" on storage.objects;
create policy "kawa staff can update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_kawa_staff());

drop policy if exists "kawa staff can delete product images" on storage.objects;
create policy "kawa staff can delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_kawa_staff());
