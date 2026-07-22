-- Run this once in the Supabase SQL Editor, after 0001-0024.
--
-- Store geocoded coordinates alongside each delivery site so the dashboard
-- client map can plot real addresses instead of the 3 demo companies. Nullable:
-- geocoding happens best-effort when a site is saved (see updateOrganizationSites
-- in app/admin/actions.ts) and can fail (bad address, Nominatim down) without
-- blocking the save — a site without coordinates simply doesn't get a map pin.

alter table public.organization_addresses
  add column if not exists lat double precision,
  add column if not exists lng double precision;
