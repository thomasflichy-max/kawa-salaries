'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { PRODUCT_CATEGORIES } from '@/lib/product-categories'

export type ProductFormState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

const VALID_CATEGORIES = PRODUCT_CATEGORIES.map((c) => c.key)

type ParsedProductForm =
  | { ok: false; error: string }
  | {
      ok: true
      values: {
        category: string
        subcategory: string | null
        tag: string | null
        name: string
        description: string | null
        price: number | null
        image_url: string | null
        hover_image_url: string | null
        sort_order: number
        purchasable: boolean
        active: boolean
        net_weight_grams: number
      }
    }

function parseProductForm(formData: FormData): ParsedProductForm {
  const category = String(formData.get('category') ?? '')
  const subcategory = String(formData.get('subcategory') ?? '').trim()
  const tag = String(formData.get('tag') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const priceRaw = String(formData.get('price') ?? '').trim()
  const imageUrl = String(formData.get('image_url') ?? '').trim()
  const hoverImageUrl = String(formData.get('hover_image_url') ?? '').trim()
  const sortOrderRaw = String(formData.get('sort_order') ?? '0').trim()
  const netWeightRaw = String(formData.get('net_weight_grams') ?? '1000').trim()
  const purchasable = formData.get('purchasable') === 'on'
  const active = formData.get('active') === 'on'

  if (!name) return { ok: false, error: 'Le nom du produit est requis.' }
  if (!VALID_CATEGORIES.includes(category as (typeof VALID_CATEGORIES)[number])) {
    return { ok: false, error: 'Catégorie invalide.' }
  }

  const price = priceRaw === '' ? null : Number(priceRaw)
  if (price !== null && (!Number.isFinite(price) || price < 0)) {
    return { ok: false, error: 'Prix invalide.' }
  }

  const sortOrder = Number(sortOrderRaw)
  if (!Number.isFinite(sortOrder)) {
    return { ok: false, error: "Ordre d'affichage invalide." }
  }

  const netWeightGrams = netWeightRaw === '' ? 1000 : Number(netWeightRaw)
  if (!Number.isFinite(netWeightGrams) || netWeightGrams <= 0) {
    return { ok: false, error: 'Poids du sachet invalide.' }
  }

  return {
    ok: true,
    values: {
      category,
      subcategory: subcategory || null,
      tag: tag || null,
      name,
      description: description || null,
      price,
      image_url: imageUrl || null,
      hover_image_url: hoverImageUrl || null,
      sort_order: sortOrder,
      purchasable,
      active,
      net_weight_grams: netWeightGrams,
    },
  }
}

export async function createProduct(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { error: 'Non autorisé.' }
  }

  const parsed = parseProductForm(formData)
  if (!parsed.ok) return { error: parsed.error, success: false }

  const { error } = await supabase.from('products').insert(parsed.values)
  if (error) {
    console.error('[createProduct] insert failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  revalidatePath('/admin/produits')
  revalidatePath('/compte/produits')
  redirect('/admin/produits')
}

export async function updateProduct(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { error: 'Non autorisé.' }
  }

  const parsed = parseProductForm(formData)
  if (!parsed.ok) return { error: parsed.error, success: false }

  const { error } = await supabase.from('products').update(parsed.values).eq('id', productId)
  if (error) {
    console.error('[updateProduct] update failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  revalidatePath('/admin/produits')
  revalidatePath('/compte/produits')
  redirect('/admin/produits')
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    throw new Error('Non autorisé.')
  }

  const { error } = await supabase.from('products').delete().eq('id', productId)
  if (error) {
    console.error('[deleteProduct] delete failed:', error)
    throw new Error('Suppression impossible.')
  }

  revalidatePath('/admin/produits')
  revalidatePath('/compte/produits')
}

export async function toggleProductActive(productId: string, active: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    throw new Error('Non autorisé.')
  }

  const { error } = await supabase.from('products').update({ active }).eq('id', productId)
  if (error) {
    console.error('[toggleProductActive] update failed:', error)
    throw new Error('Mise à jour impossible.')
  }

  revalidatePath('/admin/produits')
  revalidatePath('/compte/produits')
}

export type UploadProductImageResult = { ok: true; url: string } | { ok: false; error: string }

export async function uploadProductImageAction(
  formData: FormData
): Promise<UploadProductImageResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { ok: false, error: 'Non autorisé.' }
  }

  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: 'Fichier manquant.' }
  }
  if (!file.type.startsWith('image/')) {
    return { ok: false, error: 'Le fichier doit être une image.' }
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${crypto.randomUUID()}.${extension}`

  const { error } = await supabase.storage.from('product-images').upload(path, file, {
    contentType: file.type,
  })

  if (error) {
    console.error('[uploadProductImage] upload failed:', error)
    return { ok: false, error: "Échec de l'envoi de l'image." }
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return { ok: true, url: data.publicUrl }
}
