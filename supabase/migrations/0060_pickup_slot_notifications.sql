-- Run this once in the Supabase SQL Editor, after 0001-0059.
--
-- Two additions to the pickup-slot feature:
--
-- 1. set_pickup_slot now returns the order number + employee name (instead
--    of a bare boolean) so the calling server action can push a staff
--    notification ("Élodie a choisi son créneau") — see
--    app/retrait/actions.ts.
--
-- 2. orders/manual_orders get ready_at (stamped when the "commande prête"
--    email goes out — app/admin/commandes/actions.tsx) and
--    pickup_reminder_sent_at, so a daily cron
--    (app/api/cron/pickup-slot-followups) can nudge anyone who still hasn't
--    picked a slot 3 days after that email, exactly once.

alter table public.orders
  add column if not exists ready_at timestamptz,
  add column if not exists pickup_reminder_sent_at timestamptz;

alter table public.manual_orders
  add column if not exists ready_at timestamptz,
  add column if not exists pickup_reminder_sent_at timestamptz;

-- Return type changes, so the old signature has to be dropped first.
drop function if exists public.set_pickup_slot(uuid, date, smallint);

create function public.set_pickup_slot(p_token uuid, p_date date, p_hour smallint)
returns table (order_id uuid, order_number text, employee_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_order_number text;
  v_employee_name text;
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

  update public.orders
    set pickup_slot_date = p_date, pickup_slot_hour = p_hour
  where pickup_token = p_token
    and delivery_mode = 'pickup'
    and status not in ('livree', 'annulee')
  returning id, orders.order_number, orders.employee_name into v_id, v_order_number, v_employee_name;

  if v_id is not null then
    return query select v_id, v_order_number, v_employee_name;
    return;
  end if;

  update public.manual_orders
    set pickup_slot_date = p_date, pickup_slot_hour = p_hour
  where pickup_token = p_token
    and delivery_mode = 'pickup'
    and status not in ('livree', 'annulee')
  returning id, manual_orders.order_number, manual_orders.employee_name into v_id, v_order_number, v_employee_name;

  if v_id is not null then
    return query select v_id, v_order_number, v_employee_name;
  end if;
end;
$$;

grant execute on function public.set_pickup_slot(uuid, date, smallint) to anon, authenticated;
