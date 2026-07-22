import { createClient } from '@/lib/supabase/server'
import { getActiveProducts } from '@/lib/products'
import { computeCoffeePrice } from '@/lib/coffee-pricing'
import type { OrgEmployee, OrgSite } from './create-order-form'
import type { CatalogProduct } from './order-items-editor'

// Everything /admin/commandes/nouvelle needs to render the cascading
// organisation → salarié → catalogue picker, preloaded in one pass server
// side (see the plan note on why: no client-fetch pattern exists in this
// codebase, and the expected number of orgs/employees is modest).
export async function getCreateOrderFormData() {
  const supabase = await createClient()
  const [{ data: organizations }, { data: profiles }, { data: addresses }, { data: discounts }, baseProducts] =
    await Promise.all([
      supabase.from('organizations').select('id, name').order('name'),
      supabase
        .from('profiles')
        .select('id, full_name, email, billing_address, organization_id')
        .not('organization_id', 'is', null)
        .not('email', 'is', null),
      supabase.from('organization_addresses').select('id, organization_id, label, address').order('label'),
      supabase.from('organization_coffee_discounts').select('organization_id, subcategory, discount_amount'),
      getActiveProducts(),
    ])

  const organizationList = organizations ?? []

  const employeesByOrg: Record<string, OrgEmployee[]> = {}
  for (const profile of profiles ?? []) {
    if (!profile.organization_id || !profile.email) continue
    ;(employeesByOrg[profile.organization_id] ??= []).push({
      id: profile.id,
      fullName: profile.full_name ?? profile.email,
      email: profile.email,
      billingAddress: profile.billing_address,
    })
  }

  const sitesByOrg: Record<string, OrgSite[]> = {}
  for (const site of addresses ?? []) {
    ;(sitesByOrg[site.organization_id] ??= []).push({
      id: site.id,
      label: site.label,
      address: site.address,
    })
  }

  const discountsByOrg = new Map<string, Record<string, number>>()
  for (const rule of discounts ?? []) {
    const orgDiscounts = discountsByOrg.get(rule.organization_id) ?? {}
    orgDiscounts[rule.subcategory] = rule.discount_amount
    discountsByOrg.set(rule.organization_id, orgDiscounts)
  }

  const catalogByOrg: Record<string, CatalogProduct[]> = {}
  for (const org of organizationList) {
    const orgDiscounts = discountsByOrg.get(org.id) ?? {}
    catalogByOrg[org.id] = baseProducts.map((product) => {
      const discountedPrice =
        product.subcategory && product.basePrice != null
          ? computeCoffeePrice(product.basePrice, orgDiscounts[product.subcategory] ?? 0)
          : product.price
      return {
        id: product.id,
        name: product.name,
        category: product.category,
        imageUrl: product.image_url,
        price: discountedPrice,
        // Only surface a basePrice when a real discount is applied — avoids
        // showing a redundant "remise -0,00 €" for non-coffee products or
        // organizations without a discount for this subcategory.
        basePrice: discountedPrice !== product.basePrice ? product.basePrice : null,
      }
    })
  }

  return { organizations: organizationList, employeesByOrg, sitesByOrg, catalogByOrg }
}
