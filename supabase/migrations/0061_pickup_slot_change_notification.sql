-- Run this once in the Supabase SQL Editor, after 0001-0060.
--
-- set_pickup_slot now reports whether this call CHANGED an
-- already-chosen slot (vs. setting one for the first time), plus the
-- previous date/hour and the employee's email. app/retrait/actions.ts
-- uses this to:
--   - keep the existing "Créneau de retrait choisi" push for a first
--     choice, unchanged, and
--   - on a change, also log a persistent 'pickup_slot_changed' event
--     (via logSecurityEvent) so it shows up in Account Management even
--     if the push notification is missed — this is the gap that let
--     Élodie's slot change go unnoticed.

drop function if exists public.set_pickup_slot(uuid, date, smallint);

create function public.set_pickup_slot(p_token uuid, p_date date, p_hour smallint)
returns table (
  order_id uuid,
  order_number text,
  employee_name text,
  employee_email text,
  was_change boolean,
  previous_date date,
  previous_hour smallint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_order_number text;
  v_employee_name text;
  v_employee_email text;
  v_prev_date date;
  v_prev_hour smallint;
begin
  if p_hour is null or p_hour < 9 or p_hour > 17 then
    return;
  end if;
  if p_date is null or p_date < current_date or p_date > current_date + 30 then
    return;
  end if;
  if extract(isodow from p_date) >= 6 then
    return;
  end if;

  select o.id, o.order_number, o.employee_name, o.employee_email, o.pickup_slot_date, o.pickup_slot_hour
    into v_id, v_order_number, v_employee_name, v_employee_email, v_prev_date, v_prev_hour
  from public.orders o
  where o.pickup_token = p_token
    and o.delivery_mode = 'pickup'
    and o.status not in ('livree', 'annulee');

  if v_id is not null then
    update public.orders
      set pickup_slot_date = p_date, pickup_slot_hour = p_hour
    where id = v_id;

    return query select
      v_id, v_order_number, v_employee_name, v_employee_email,
      (v_prev_date is not null and (v_prev_date <> p_date or v_prev_hour is distinct from p_hour)),
      v_prev_date, v_prev_hour;
    return;
  end if;

  select mo.id, mo.order_number, mo.employee_name, mo.employee_email, mo.pickup_slot_date, mo.pickup_slot_hour
    into v_id, v_order_number, v_employee_name, v_employee_email, v_prev_date, v_prev_hour
  from public.manual_orders mo
  where mo.pickup_token = p_token
    and mo.delivery_mode = 'pickup'
    and mo.status not in ('livree', 'annulee');

  if v_id is not null then
    update public.manual_orders
      set pickup_slot_date = p_date, pickup_slot_hour = p_hour
    where id = v_id;

    return query select
      v_id, v_order_number, v_employee_name, v_employee_email,
      (v_prev_date is not null and (v_prev_date <> p_date or v_prev_hour is distinct from p_hour)),
      v_prev_date, v_prev_hour;
  end if;
end;
$$;

grant execute on function public.set_pickup_slot(uuid, date, smallint) to anon, authenticated;
