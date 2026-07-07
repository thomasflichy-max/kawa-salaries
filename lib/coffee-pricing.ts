import { createClient } from '@/lib/supabase/server'

export async function getCoffeePricing() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('coffee_pricing')
    .select('subcategory, base_price, discount_percent')

  if (error) {
    console.error('[coffee-pricing] failed to load pricing rules:', error)
  }

  return new Map((data ?? []).map((rule) => [rule.subcategory, rule]))
}

export function computeCoffeePrice(
  basePrice: number,
  discountPercent: number
) {
  return Math.round(basePrice * (1 - discountPercent / 100) * 100) / 100
}
