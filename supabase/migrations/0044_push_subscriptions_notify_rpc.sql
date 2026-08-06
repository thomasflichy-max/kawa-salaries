-- push_subscriptions' RLS ("auth.uid() = user_id and is_kawa_staff()") only
-- lets a staff member see their OWN subscription — but notifyStaffDevices()
-- runs inside submitSupportMessage, under the EMPLOYEE's session (they're
-- the one submitting the message), not a staff session. That query was
-- silently returning 0 rows (not an error — just correctly RLS-filtered to
-- nothing), so every push send loop had nothing to iterate over. Same shape
-- of bug as the earlier suspendEmployee RLS issue: the caller isn't the
-- resource's owner, so it needs a SECURITY DEFINER function instead of the
-- regular RLS-scoped client, matching the pattern used by
-- next_document_number()/find_organization_by_domain().

create or replace function public.get_push_subscriptions_for_notify()
returns table (id uuid, subscription jsonb)
language sql
security definer
set search_path = public
stable
as $$
  select id, subscription from public.push_subscriptions;
$$;

grant execute on function public.get_push_subscriptions_for_notify() to authenticated;

-- Same reasoning for pruning an expired subscription after a failed send.
create or replace function public.prune_push_subscription(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  delete from public.push_subscriptions where id = p_id;
$$;

grant execute on function public.prune_push_subscription(uuid) to authenticated;
