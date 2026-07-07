-- Run this once in the Supabase SQL Editor (or via `supabase db push`).

-- 1. Domain lookup used by the signup flow, callable by anonymous visitors.
-- security definer + fixed search_path so it can read `organizations` regardless
-- of caller, without granting anon a broad SELECT on the table (discount_rate
-- stays hidden from unauthenticated users).
create or replace function public.find_organization_by_domain(input_domain text)
returns table (id uuid, name text)
language sql
security definer
set search_path = public
stable
as $$
  select o.id, o.name
  from public.organizations o
  where o.active = true
    and lower(o.domain) = lower(input_domain)
  limit 1;
$$;

grant execute on function public.find_organization_by_domain(text) to anon, authenticated;

-- 2. kawa staff = anyone authenticated with an @kawa.coffee email.
-- Used to gate the internal admin dashboard.
create or replace function public.is_kawa_staff()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((auth.jwt() ->> 'email') ilike '%@kawa.coffee', false);
$$;

grant execute on function public.is_kawa_staff() to authenticated;

-- 3. Auto-create the profile row when a new auth user signs up.
-- Expects organization_id and full_name to be passed as signUp() metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, organization_id)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    (new.raw_user_meta_data ->> 'organization_id')::uuid
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Row Level Security.
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.orders enable row level security;

-- organizations: only kawa staff can browse the raw table (regular signup
-- goes through find_organization_by_domain above).
drop policy if exists "kawa staff can read organizations" on public.organizations;
create policy "kawa staff can read organizations"
  on public.organizations for select
  using (public.is_kawa_staff());

-- profiles: a user can read/update their own profile; kawa staff can read all.
drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_kawa_staff());

drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- orders: a user can read/create their own orders; kawa staff can read all.
drop policy if exists "users read own orders" on public.orders;
create policy "users read own orders"
  on public.orders for select
  using (auth.uid() = user_id or public.is_kawa_staff());

drop policy if exists "users insert own orders" on public.orders;
create policy "users insert own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);
