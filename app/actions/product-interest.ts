'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

// Toggle: no vote yet -> insert; already voted -> withdraw. One row per
// (product, salarié), see product_interest_votes RLS ("own row only").
export async function toggleProductInterestAction(productId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Session expirée, merci de vous reconnecter.', interested: false }
  }

  const { data: existing } = await supabase
    .from('product_interest_votes')
    .select('id')
    .eq('product_id', productId)
    .eq('profile_id', user.id)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('product_interest_votes')
      .delete()
      .eq('id', existing.id)
    if (error) {
      console.error('[toggleProductInterestAction] delete failed:', error)
      return { error: 'Une erreur est survenue, merci de réessayer.', interested: true }
    }
    revalidatePath(`/compte/produits/produit/${productId}`)
    return { interested: false }
  }

  const { error } = await supabase
    .from('product_interest_votes')
    .insert({ product_id: productId, profile_id: user.id })
  if (error) {
    console.error('[toggleProductInterestAction] insert failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.', interested: false }
  }
  revalidatePath(`/compte/produits/produit/${productId}`)
  return { interested: true }
}
