-- Run this once in the Supabase SQL Editor, after 0001-0023.
--
-- profiles never stored the employee's own email (only auth.users does,
-- which isn't queryable from the app's client) — needed to link a real
-- registered employee to their orders (matched by email, same as everywhere
-- else orders are looked up) from their admin account page.

alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, organization_id, email)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    (new.raw_user_meta_data ->> 'organization_id')::uuid,
    new.email
  );
  return new;
end;
$$;
