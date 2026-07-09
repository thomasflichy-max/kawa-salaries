-- Run this once in the Supabase SQL Editor, after 0001-0017.
--
-- Invoices are billed to the employee (B2C), not their employer — each
-- employee needs their own billing address, set at signup.

alter table public.profiles
  add column if not exists billing_address text;

-- Carry billing_address through from signup (raw_user_meta_data) same as
-- full_name/organization_id already do.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, organization_id, billing_address)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    (new.raw_user_meta_data ->> 'organization_id')::uuid,
    new.raw_user_meta_data ->> 'billing_address'
  );
  return new;
end;
$$;
