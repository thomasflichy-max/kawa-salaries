-- Run this once in the Supabase SQL Editor, after 0001-0054.
--
-- Once an order is livrée (or annulée) there's nothing left to schedule —
-- stop set_pickup_slot from touching it, and expose the status so the
-- scheduling page / account card can hide the form.

-- Return type changes, so the old signature has to be dropped first.
drop function if exists public.get_pickup_slot(uuid);

create function public.get_pickup_slot(p_token uuid)
returns table (
  order_number text,
  delivery_mode text,
  status text,
  pickup_slot_date date,
  pickup_slot_hour smallint
)
language sql
security definer
set search_path = public
stable
as $$
  select order_number, delivery_mode, status, pickup_slot_date, pickup_slot_hour
  from public.orders
  where pickup_token = p_token
  union all
  select order_number, delivery_mode, status, pickup_slot_date, pickup_slot_hour
  from public.manual_orders
  where pickup_token = p_token
  limit 1;
$$;

grant execute on function public.get_pickup_slot(uuid) to anon, authenticated;

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
    set pickup_slot_date = p_date, pickup_slot_hour = p_hour
  where pickup_token = p_token
    and delivery_mode = 'pickup'
    and status not in ('livree', 'annulee')
  returning true into v_found;
  if coalesce(v_found, false) then
    return true;
  end if;

  update public.manual_orders
    set pickup_slot_date = p_date, pickup_slot_hour = p_hour
  where pickup_token = p_token
    and delivery_mode = 'pickup'
    and status not in ('livree', 'annulee')
  returning true into v_found;
  return coalesce(v_found, false);
end;
$$;
