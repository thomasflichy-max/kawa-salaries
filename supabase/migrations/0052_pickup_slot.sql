-- Run this once in the Supabase SQL Editor, after 0001-0051.
--
-- Lets a "Retrait KAWA Nantes" customer state when they plan to come by,
-- from a link in the "commande prête" email. It's an indicative preference
-- (no capacity limit, no blocking) shown to staff on the order — not a
-- booking. Day + 1h slot, weekdays, 09h-18h.
--
--   pickup_slot_date / pickup_slot_hour : the chosen slot (hour = start, so
--                                         14 means 14h-15h). Null = not set.
--   pickup_token                        : unguessable per-order token for the
--                                         email link (recipient has no session).

alter table public.orders
  add column if not exists pickup_slot_date date,
  add column if not exists pickup_slot_hour smallint,
  add column if not exists pickup_token uuid not null default gen_random_uuid();

-- Read the current slot for the scheduling page (token is the secret, so
-- returning the order number is fine).
create or replace function public.get_pickup_slot(p_token uuid)
returns table (order_number text, delivery_mode text, pickup_slot_date date, pickup_slot_hour smallint)
language sql
security definer
set search_path = public
stable
as $$
  select o.order_number, o.delivery_mode, o.pickup_slot_date, o.pickup_slot_hour
  from public.orders o
  where o.pickup_token = p_token
  limit 1;
$$;

-- Set / change the slot. Validates weekday + 09h-17h start + within 30 days
-- and not in the past.
create or replace function public.set_pickup_slot(p_token uuid, p_date date, p_hour smallint)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_found boolean;
begin
  if p_hour is null or p_hour < 9 or p_hour > 17 then
    return false;
  end if;
  if p_date is null or p_date < current_date or p_date > current_date + 30 then
    return false;
  end if;
  if extract(isodow from p_date) >= 6 then
    return false;
  end if;

  update public.orders
    set pickup_slot_date = p_date,
        pickup_slot_hour = p_hour
  where pickup_token = p_token
    and delivery_mode = 'pickup'
  returning true into v_found;

  return coalesce(v_found, false);
end;
$$;

grant execute on function public.get_pickup_slot(uuid) to anon, authenticated;
grant execute on function public.set_pickup_slot(uuid, date, smallint) to anon, authenticated;
