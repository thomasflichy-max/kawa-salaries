// Deliberately dependency-free (no Supabase/server imports): both admin
// order forms (client components) and the checkout server action need
// these, and a client component importing anything from lib/products.ts
// would drag lib/supabase/server.ts (next/headers) into the browser bundle
// and break the build — see the "You're importing a module that depends on
// next/headers" Turbopack error this file was split out to fix.

// Coffee (category "cafe") is taxed as a food product at 5.5%, everything
// else (machines, entretien) at the standard 20% rate — same split used
// everywhere an order line item is built, from admin manual orders to real
// checkout, to the invoice PDF.
export function vatRateFor(category: string) {
  return category === 'cafe' ? 0.055 : 0.2
}
export function unitFor(category: string) {
  return category === 'cafe' ? ('Kg' as const) : ('unité' as const)
}
