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
    .replace(/^@/, '')
    .split('/')[0]
}

const COFFEE_SUBCATEGORIES = ['classique', 'bio', 'decafeine'] as const

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
  const active = formData.get('active') === 'on'
  const sampleEmail = String(formData.get('sample_email') ?? '').trim()

  if (!name) {
    return { error: "Le nom de l'entreprise est requis." }
  }
  if (!domain || !domain.includes('.') || /\s/.test(domain)) {
    return {
      error:
        'Domaine invalide. Renseigne le domaine email des salariés (ex: colbertgroupe.com), pas une URL de site web.',
    }
  }
  if (sampleEmail && !sampleEmail.toLowerCase().endsWith(`@${domain}`)) {
    return { error: `Le mail type doit se terminer par "@${domain}".` }
  }

  const discountAmounts: Record<(typeof COFFEE_SUBCATEGORIES)[number], number> = {
    classique: Number(formData.get('discount_classique')),
    bio: Number(formData.get('discount_bio')),
    decafeine: Number(formData.get('discount_decafeine')),
  }
  for (const subcategory of COFFEE_SUBCATEGORIES) {
    const amount = discountAmounts[subcategory]
    if (!Number.isFinite(amount) || amount < 0) {
      return { error: `La remise "${subcategory}" doit être un montant positif en €.` }
    }
  }

  const siteLabels = formData.getAll('site_label').map((v) => String(v).trim())
  const siteAddresses = formData.getAll('site_address').map((v) => String(v).trim())
  const sites = siteLabels
    .map((label, i) => ({ label, address: siteAddresses[i] ?? '' }))
    .filter((site) => site.label && site.address)

  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name,
      domain,
      active,
      sample_email: sampleEmail || null,
    })
    .select('id')
    .single()

  if (error || !org) {
    return {
      error:
        error?.code === '23505'
          ? `Une entreprise avec le domaine "${domain}" existe déjà.`
          : 'Une erreur est survenue, merci de réessayer.',
    }
  }

  const { error: discountsError } = await supabase.from('organization_coffee_discounts').insert(
    COFFEE_SUBCATEGORIES.map((subcategory) => ({
      organization_id: org.id,
      subcategory,
      discount_amount: discountAmounts[subcategory],
    }))
  )
  if (discountsError) {
    console.error('[createOrganization] discounts insert failed:', discountsError)
    return { error: "L'entreprise a été créée mais l'enregistrement des remises a échoué." }
  }

  if (sites.length > 0) {
    const { error: sitesError } = await supabase.from('organization_addresses').insert(
      sites.map((site) => ({
        organization_id: org.id,
        label: site.label,
        address: site.address,
      }))
    )
    if (sitesError) {
      console.error('[createOrganization] sites insert failed:', sitesError)
      return { error: "L'entreprise a été créée mais l'enregistrement des sites a échoué." }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/clients')
  revalidatePath('/admin/comptes')
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

  const rows: { subcategory: 'classique' | 'bio' | 'decafeine' }[] = [
    { subcategory: 'classique' },
    { subcategory: 'bio' },
    { subcategory: 'decafeine' },
  ]

  for (const { subcategory } of rows) {
    const basePrice = Number(formData.get(`${subcategory}_base_price`))

    if (!Number.isFinite(basePrice) || basePrice < 0) {
      return { error: `Prix de base invalide pour "${subcategory}".` }
    }

    const { error } = await supabase
      .from('coffee_pricing')
      .update({ base_price: basePrice })
      .eq('subcategory', subcategory)

    if (error) {
      console.error('[updateCoffeePricing] update failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/produits')
  revalidatePath('/compte/produits')
  return { success: true }
}

export type UpdateOrganizationState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

export async function updateOrganizationInfo(
  organizationId: string,
  _prevState: UpdateOrganizationState,
  formData: FormData
): Promise<UpdateOrganizationState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { error: 'Non autorisé.' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const domain = normalizeDomain(String(formData.get('domain') ?? ''))
  const active = formData.get('active') === 'on'
  const sampleEmail = String(formData.get('sample_email') ?? '').trim()

  if (!name) {
    return { error: "Le nom de l'entreprise est requis." }
  }
  if (!domain || !domain.includes('.') || /\s/.test(domain)) {
    return {
      error:
        'Domaine invalide. Renseigne le domaine email des salariés (ex: colbertgroupe.com), pas une URL de site web.',
    }
  }
  if (sampleEmail && !sampleEmail.toLowerCase().endsWith(`@${domain}`)) {
    return { error: `Le mail type doit se terminer par "@${domain}".` }
  }

  const { error } = await supabase
    .from('organizations')
    .update({ name, domain, active, sample_email: sampleEmail || null })
    .eq('id', organizationId)

  if (error) {
    return {
      error:
        error.code === '23505'
          ? `Une entreprise avec le domaine "${domain}" existe déjà.`
          : 'Une erreur est survenue, merci de réessayer.',
    }
  }

  revalidatePath(`/admin/comptes/${organizationId}`)
  revalidatePath('/admin/comptes')
  return { success: true }
}

export async function updateOrganizationDiscounts(
  organizationId: string,
  _prevState: UpdateOrganizationState,
  formData: FormData
): Promise<UpdateOrganizationState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { error: 'Non autorisé.' }
  }

  const discountAmounts: Record<(typeof COFFEE_SUBCATEGORIES)[number], number> = {
    classique: Number(formData.get('discount_classique')),
    bio: Number(formData.get('discount_bio')),
    decafeine: Number(formData.get('discount_decafeine')),
  }
  for (const subcategory of COFFEE_SUBCATEGORIES) {
    const amount = discountAmounts[subcategory]
    if (!Number.isFinite(amount) || amount < 0) {
      return { error: `La remise "${subcategory}" doit être un montant positif en €.` }
    }
  }

  const { error } = await supabase.from('organization_coffee_discounts').upsert(
    COFFEE_SUBCATEGORIES.map((subcategory) => ({
      organization_id: organizationId,
      subcategory,
      discount_amount: discountAmounts[subcategory],
    })),
    { onConflict: 'organization_id,subcategory' }
  )

  if (error) {
    console.error('[updateOrganizationDiscounts] upsert failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  revalidatePath(`/admin/comptes/${organizationId}`)
  revalidatePath('/admin/comptes')
  revalidatePath('/compte/produits')
  return { success: true }
}

export async function updateOrganizationSites(
  organizationId: string,
  _prevState: UpdateOrganizationState,
  formData: FormData
): Promise<UpdateOrganizationState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { error: 'Non autorisé.' }
  }

  const siteIds = formData.getAll('site_id').map((v) => String(v))
  const siteLabels = formData.getAll('site_label').map((v) => String(v).trim())
  const siteAddresses = formData.getAll('site_address').map((v) => String(v).trim())
  const submitted = siteIds
    .map((id, i) => ({ id: id || null, label: siteLabels[i] ?? '', address: siteAddresses[i] ?? '' }))
    .filter((site) => site.label && site.address)

  const { data: existingSites, error: fetchError } = await supabase
    .from('organization_addresses')
    .select('id')
    .eq('organization_id', organizationId)

  if (fetchError) {
    console.error('[updateOrganizationSites] fetch failed:', fetchError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  // Existing sites keep their id (update in place) instead of a blanket
  // delete-then-reinsert — a salarié's saved default_address_id points at a
  // specific site row, and would silently reset to "Retrait KAWA Nantes"
  // every time this form saves if that id churned on every edit.
  const existingIds = new Set((existingSites ?? []).map((s) => s.id))
  const submittedIds = new Set(submitted.filter((s) => s.id).map((s) => s.id as string))
  const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id))
  const toUpdate = submitted.filter((s) => s.id && existingIds.has(s.id))
  const toInsert = submitted.filter((s) => !s.id || !existingIds.has(s.id))

  if (idsToDelete.length > 0) {
    const { error } = await supabase.from('organization_addresses').delete().in('id', idsToDelete)
    if (error) {
      console.error('[updateOrganizationSites] delete failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  for (const site of toUpdate) {
    const { error } = await supabase
      .from('organization_addresses')
      .update({ label: site.label, address: site.address })
      .eq('id', site.id as string)
    if (error) {
      console.error('[updateOrganizationSites] update failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('organization_addresses').insert(
      toInsert.map((site) => ({
        organization_id: organizationId,
        label: site.label,
        address: site.address,
      }))
    )
    if (error) {
      console.error('[updateOrganizationSites] insert failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  revalidatePath(`/admin/comptes/${organizationId}`)
  revalidatePath('/compte')
  return { success: true }
}
