'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'

export type CreateOrganizationState = { error: string; success?: false } | { success: true; error?: undefined } | undefined

function normalizeDomain(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .split('/')[0]
}

export async function createOrganization(
  _prevState: CreateOrganizationState,
  formData: FormData
): Promise<CreateOrganizationState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Server Actions are reachable directly regardless of UI visibility — the
  // page-level check in AdminLayout is not a substitute for this.
  if (!isKawaStaffEmail(user?.email)) {
    return { error: 'Non autorisé.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const domain = normalizeDomain(String(formData.get('domain') ?? ''))
  const discountRate = Number(formData.get('discount_rate'))
  const active = formData.get('active') === 'on'

  if (!name) {
    return { error: "Le nom de l'entreprise est requis." }
  }
  if (!domain || !domain.includes('.') || /\s/.test(domain)) {
    return {
      error:
        'Domaine invalide. Renseigne le domaine email des salariés (ex: colbertgroupe.com), pas une URL de site web.',
    }
  }
  if (!Number.isInteger(discountRate) || discountRate < 0 || discountRate > 100) {
    return { error: 'La remise doit être un entier entre 0 et 100.' }
  }

  const { error } = await supabase.from('organizations').insert({
    name,
    domain,
    discount_rate: discountRate,
    active,
  })

  if (error) {
    return {
      error:
        error.code === '23505'
          ? `Une entreprise avec le domaine "${domain}" existe déjà.`
          : 'Une erreur est survenue, merci de réessayer.',
    }
  }

  revalidatePath('/admin')
  return { success: true }
}

export type UpdateCoffeePricingState = { error: string; success?: false } | { success: true; error?: undefined } | undefined

export async function updateCoffeePricing(
  _prevState: UpdateCoffeePricingState,
  formData: FormData
): Promise<UpdateCoffeePricingState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { error: 'Non autorisé.' }
  }

  const rows: { subcategory: 'classique' | 'bio' }[] = [
    { subcategory: 'classique' },
    { subcategory: 'bio' },
  ]

  for (const { subcategory } of rows) {
    const basePrice = Number(formData.get(`${subcategory}_base_price`))
    const discountPercent = Number(formData.get(`${subcategory}_discount_percent`))

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return { error: `Prix de base invalide pour "${subcategory}".` }
    }
    if (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100) {
      return { error: `Remise invalide pour "${subcategory}" (0 à 100).` }
    }

    const { error } = await supabase
      .from('coffee_pricing')
      .update({ base_price: basePrice, discount_percent: discountPercent })
      .eq('subcategory', subcategory)

    if (error) {
      console.error('[updateCoffeePricing] update failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/compte/produits')
  return { success: true }
}
