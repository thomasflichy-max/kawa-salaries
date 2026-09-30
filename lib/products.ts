import { createClient } from '@/lib/supabase/server'
import { getCoffeePricing, computeCoffeePrice } from '@/lib/coffee-pricing'
import type { Locale } from '@/lib/i18n/locale'

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

const PRODUCT_FIELDS =
  'id, category, subcategory, tag, name, description, short_description, name_en, description_en, short_description_en, flavor_tags, price, image_url, hover_image_url, purchasable, in_stock, net_weight_grams'

// English text is optional per-product (admin/produits) — falls back to
// French rather than showing blank when a product has no translation yet.
export function localizeProduct<
  T extends {
    name: string
    description: string | null
    short_description: string | null
    name_en?: string | null
    description_en?: string | null
    short_description_en?: string | null
  }
>(product: T, locale: Locale): T {
  if (locale !== 'en') return product
  return {
    ...product,
    name: product.name_en || product.name,
    description: product.description_en || product.description,
    short_description: product.short_description_en || product.short_description,
  }
}

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
