// Deliberately dependency-free (no Supabase/server imports): both admin
// order forms (client components) and the checkout server action need
// these, and a client component importing anything from lib/products.ts
// would drag lib/supabase/server.ts (next/headers) into the browser bundle
// and break the build — see the "You're importing a module that depends on
// next/headers" Turbopack error this file was split out to fix.

// Coffee and tea (categories "cafe"/"the") are foodstuffs, taxed at the
// reduced 5.5% rate; everything else (machines, entretien) at the standard
// 20% rate — same split used everywhere an order line item is built, from
// admin manual orders to real checkout, to the invoice PDF.
export function vatRateFor(category: string) {
  return category === 'cafe' || category === 'the' ? 0.055 : 0.2
}
export function unitFor(category: string) {
  return category === 'cafe' ? ('Kg' as const) : ('unité' as const)
}

// The admin "ajout client" / discounts form lets staff enter what the
// employer actually pays HT per kg, instead of a raw discount amount — this
// converts between the two. coffee_pricing.base_price is TTC (what the
// salarié sees with no discount at all), so the employer's HT price has to
// become TTC before it can be subtracted from it.
//
// coffeeDiscountFromHtPrice can return a negative number (HT price above the
// base retail price) — callers must reject that rather than silently
// clamping it to 0, since a negative "remise" means the admin mistyped the
// price, not that there's genuinely no discount.
export function coffeeDiscountFromHtPrice(basePriceTtc: number, htPricePerKg: number) {
  const ttc = Math.round(htPricePerKg * (1 + vatRateFor('cafe')) * 100) / 100
  return Math.round((basePriceTtc - ttc) * 100) / 100
}

// Inverse — used to prefill the HT-price field from an already-stored
// discount_amount when editing an existing organization.
export function htPriceFromCoffeeDiscount(basePriceTtc: number, discountAmount: number) {
  const ttc = basePriceTtc - discountAmount
  return Math.round((ttc / (1 + vatRateFor('cafe'))) * 100) / 100
}
