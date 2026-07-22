'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { geocodeAddress } from '@/lib/geocode'
import type { Database } from '@/lib/supabase/types'

type OrganizationAddressUpdate = Database['public']['Tables']['organization_addresses']['Update']
type OrganizationSampleEmailUpdate = Database['public']['Tables']['organization_sample_emails']['Update']

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
  const sampleEmails = formData
    .getAll('sample_email')
    .map((v) => String(v).trim())
    .filter(Boolean)

  if (!name) {
    return { error: "Le nom de l'entreprise est requis." }
  }
  if (!domain || !domain.includes('.') || /\s/.test(domain)) {
    return {
      error:
        'Domaine invalide. Renseigne le domaine email des salariés (ex: colbertgroupe.com), pas une URL de site web.',
    }
  }
  const invalidSampleEmail = sampleEmails.find((email) => !email.toLowerCase().endsWith(`@${domain}`))
  if (invalidSampleEmail) {
    return { error: `Le mail type "${invalidSampleEmail}" doit se terminer par "@${domain}".` }
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

  if (sampleEmails.length > 0) {
    const { error: sampleEmailsError } = await supabase.from('organization_sample_emails').insert(
      sampleEmails.map((email) => ({
        organization_id: org.id,
        email,
      }))
    )
    if (sampleEmailsError) {
      console.error('[createOrganization] sample emails insert failed:', sampleEmailsError)
      return { error: "L'entreprise a été créée mais l'enregistrement des mails types a échoué." }
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

  if (!name) {
    return { error: "Le nom de l'entreprise est requis." }
  }
  if (!domain || !domain.includes('.') || /\s/.test(domain)) {
    return {
      error:
        'Domaine invalide. Renseigne le domaine email des salariés (ex: colbertgroupe.com), pas une URL de site web.',
    }
  }

  const { error } = await supabase
    .from('organizations')
    .update({ name, domain, active })
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
    .select('id, address, lat, lng')
    .eq('organization_id', organizationId)

  if (fetchError) {
    console.error('[updateOrganizationSites] fetch failed:', fetchError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  // Existing sites keep their id (update in place) instead of a blanket
  // delete-then-reinsert — a salarié's saved default_address_id points at a
  // specific site row, and would silently reset to "Retrait KAWA Nantes"
  // every time this form saves if that id churned on every edit.
  const existingById = new Map((existingSites ?? []).map((s) => [s.id, s]))
  const existingIds = new Set(existingById.keys())
  const submittedIds = new Set(submitted.filter((s) => s.id).map((s) => s.id as string))
  const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id))
  const toUpdate = submitted.filter((s) => s.id && existingIds.has(s.id))
  const toInsert = submitted.filter((s) => !s.id || !existingIds.has(s.id))

  // Re-geocode sites whose address text changed, is brand new, or (for sites
  // saved before the lat/lng columns existed) never got coordinates in the
  // first place — so re-saving an untouched form still backfills old sites.
  // Nominatim is rate-limited to 1 req/sec, so this stays sequential, not
  // Promise.all, and skips sites that don't need it.
  const changedSites = [
    ...toInsert,
    ...toUpdate.filter((s) => {
      const existing = existingById.get(s.id as string)
      return existing?.address !== s.address || existing?.lat == null || existing?.lng == null
    }),
  ]
  const coordsByAddress = new Map<string, { lat: number; lng: number } | null>()
  for (const site of changedSites) {
    if (coordsByAddress.has(site.address)) continue
    const coords = await geocodeAddress(site.address)
    if (!coords) {
      console.error('[updateOrganizationSites] geocoding found no match for address:', site.address)
    }
    coordsByAddress.set(site.address, coords)
  }

  if (idsToDelete.length > 0) {
    const { error } = await supabase.from('organization_addresses').delete().in('id', idsToDelete)
    if (error) {
      console.error('[updateOrganizationSites] delete failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  for (const site of toUpdate) {
    const update: OrganizationAddressUpdate = { label: site.label, address: site.address }
    if (coordsByAddress.has(site.address)) {
      const coords = coordsByAddress.get(site.address)
      update.lat = coords?.lat ?? null
      update.lng = coords?.lng ?? null
    }
    const { error } = await supabase
      .from('organization_addresses')
      .update(update)
      .eq('id', site.id as string)
    if (error) {
      console.error('[updateOrganizationSites] update failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('organization_addresses').insert(
      toInsert.map((site) => {
        const coords = coordsByAddress.get(site.address)
        return {
          organization_id: organizationId,
          label: site.label,
          address: site.address,
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
        }
      })
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

export async function updateOrganizationSampleEmails(
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

  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .select('domain')
    .eq('id', organizationId)
    .single()

  if (orgError || !org) {
    console.error('[updateOrganizationSampleEmails] org fetch failed:', orgError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  const emailIds = formData.getAll('email_id').map((v) => String(v))
  const emailValues = formData.getAll('email_value').map((v) => String(v).trim())
  const submitted = emailIds
    .map((id, i) => ({ id: id || null, email: emailValues[i] ?? '' }))
    .filter((entry) => entry.email)

  const invalidEmail = submitted.find(
    (entry) => !entry.email.toLowerCase().endsWith(`@${org.domain}`)
  )
  if (invalidEmail) {
    return { error: `Le mail type "${invalidEmail.email}" doit se terminer par "@${org.domain}".` }
  }

  const { data: existingEmails, error: fetchError } = await supabase
    .from('organization_sample_emails')
    .select('id')
    .eq('organization_id', organizationId)

  if (fetchError) {
    console.error('[updateOrganizationSampleEmails] fetch failed:', fetchError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  // Same update-in-place pattern as updateOrganizationSites — keeps row ids
  // stable across saves instead of a blanket delete-then-reinsert.
  const existingIds = new Set((existingEmails ?? []).map((e) => e.id))
  const submittedIds = new Set(submitted.filter((e) => e.id).map((e) => e.id as string))
  const idsToDelete = [...existingIds].filter((id) => !submittedIds.has(id))
  const toUpdate = submitted.filter((e) => e.id && existingIds.has(e.id))
  const toInsert = submitted.filter((e) => !e.id || !existingIds.has(e.id))

  if (idsToDelete.length > 0) {
    const { error } = await supabase
      .from('organization_sample_emails')
      .delete()
      .in('id', idsToDelete)
    if (error) {
      console.error('[updateOrganizationSampleEmails] delete failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  for (const entry of toUpdate) {
    const update: OrganizationSampleEmailUpdate = { email: entry.email }
    const { error } = await supabase
      .from('organization_sample_emails')
      .update(update)
      .eq('id', entry.id as string)
    if (error) {
      console.error('[updateOrganizationSampleEmails] update failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  if (toInsert.length > 0) {
    const { error } = await supabase.from('organization_sample_emails').insert(
      toInsert.map((entry) => ({
        organization_id: organizationId,
        email: entry.email,
      }))
    )
    if (error) {
      console.error('[updateOrganizationSampleEmails] insert failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.' }
    }
  }

  revalidatePath(`/admin/comptes/${organizationId}`)
  return { success: true }
}
