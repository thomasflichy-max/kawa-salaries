-- Run this once in the Supabase SQL Editor, after 0001-0012.

alter table public.organizations
  add column if not exists delivery_address text;
