import { createClient } from '@/lib/supabase/server'

export async function getCoffeePricing() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('coffee_pricing').select('subcategory, base_price')

  if (error) {
    console.error('[coffee-pricing] failed to load pricing rules:', error)
  }

  return new Map((data ?? []).map((rule) => [rule.subcategory, rule]))
}

// The discount applied here is a flat € amount negotiated by the employer for
// this coffee subcategory (organization_coffee_discounts) — each company can
// have a different amount per subcategory, off the same shared base price.
export function computeCoffeePrice(basePrice: number, discountAmount: number) {
  return Math.max(0, Math.round((basePrice - discountAmount) * 100) / 100)
}
