import { createClient } from '@/lib/supabase/server'
import { getCoffeePricing, computeCoffeePrice } from '@/lib/coffee-pricing'

type CoffeePricingRules = Awaited<ReturnType<typeof getCoffeePricing>>
export type CoffeeDiscounts = Record<string, number>

export function resolveProductPricing(
  product: { price: number | null; subcategory: string | null },
  pricingRules: CoffeePricingRules,
  coffeeDiscounts: CoffeeDiscounts = {}
): { price: number | null; basePrice: number | null } {
  if (!product.subcategory) {
    return { price: product.price, basePrice: null }
  }
  const rule = pricingRules.get(product.subcategory)
  if (!rule) {
    return { price: product.price, basePrice: null }
  }
  return {
    price: computeCoffeePrice(rule.base_price, coffeeDiscounts[product.subcategory] ?? 0),
    basePrice: rule.base_price,
  }
}

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

const PRODUCT_FIELDS =
  'id, category, subcategory, tag, name, description, price, image_url, hover_image_url, purchasable, net_weight_grams'

export async function getActiveProducts(category?: string, coffeeDiscounts: CoffeeDiscounts = {}) {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('active', true)
    .order('sort_order')
    .order('name')

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) {
    console.error('[produits] failed to load products:', error)
  }

  const products = data ?? []
  const hasCoffee = products.some((p) => p.subcategory)
  const pricingRules = hasCoffee ? await getCoffeePricing() : new Map()

  return products.map((product) => ({
    ...product,
    ...resolveProductPricing(product, pricingRules, coffeeDiscounts),
  }))
}

export async function getProductById(id: string, coffeeDiscounts: CoffeeDiscounts = {}) {
  const supabase = await createClient()
  const { data: product, error } = await supabase
    .from('products')
    .select(PRODUCT_FIELDS)
    .eq('id', id)
    .eq('active', true)
    .maybeSingle()

  if (error) {
    console.error('[produits] failed to load product:', error)
  }
  if (!product) {
    return null
  }

  const pricingRules = await getCoffeePricing()
  return { ...product, ...resolveProductPricing(product, pricingRules, coffeeDiscounts) }
}
