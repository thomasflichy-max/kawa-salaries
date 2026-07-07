-- Run this once in the Supabase SQL Editor, after 0001-0010.

create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.support_messages enable row level security;

drop policy if exists "users can send own support messages" on public.support_messages;
create policy "users can send own support messages"
  on public.support_messages for insert
  with check (auth.uid() = user_id);

drop policy if exists "kawa staff can read support messages" on public.support_messages;
create policy "kawa staff can read support messages"
  on public.support_messages for select
  using (public.is_kawa_staff());
