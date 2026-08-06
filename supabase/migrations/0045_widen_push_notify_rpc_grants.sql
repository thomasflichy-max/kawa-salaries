-- Some security_events producers run with NO session at all (e.g.
-- unauthorized_admin_access is logged from lib/supabase/proxy.ts middleware
-- when a fully anonymous visitor hits /admin) — that request uses the `anon`
-- role, which 0044's `grant ... to authenticated` doesn't cover. Widening to
-- match security_events' own insert policy (open to everyone, `with check
-- (true)`), since these RPCs are exactly as sensitive as that already is.
grant execute on function public.get_push_subscriptions_for_notify() to anon;
grant execute on function public.prune_push_subscription(uuid) to anon;
