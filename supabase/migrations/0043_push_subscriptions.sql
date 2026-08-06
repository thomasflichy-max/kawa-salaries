-- Web Push subscriptions, one row per (staff member, browser/device) pair —
-- lets a staff member get an OS-level notification (macOS Notification
-- Center, etc.) on a specific computer for new "Sécurité & support" items,
-- as an alternative to the email that used to fire on every support message.
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null unique,
  subscription jsonb not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.push_subscriptions enable row level security;

-- Only staff use this feature, and only ever manage their own subscriptions
-- (one per device they click "activer" on).
drop policy if exists "staff manage own push subscriptions" on public.push_subscriptions;
create policy "staff manage own push subscriptions"
  on public.push_subscriptions for all
  using (auth.uid() = user_id and public.is_kawa_staff())
  with check (auth.uid() = user_id and public.is_kawa_staff());
