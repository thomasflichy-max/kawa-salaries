'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { addToCart } from './cart'
import { FREQUENCY_WEEKS } from '@/lib/subscription-frequency'

async function requireUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion?next=/compte/abonnements')
  }

  return { supabase, userId: user.id }
}

function nextReminderDate(frequencyWeeks: number) {
  const date = new Date()
  date.setDate(date.getDate() + frequencyWeeks * 7)
  return date.toISOString().slice(0, 10)
}

export type SubscriptionFormState = { error: string } | { success: true } | undefined

export async function createSubscription(
  _prevState: SubscriptionFormState,
  formData: FormData
): Promise<SubscriptionFormState> {
  const { supabase, userId } = await requireUserId()

  const productId = String(formData.get('product_id') ?? '')
  const quantity = Number(formData.get('quantity') ?? 1)
  const grindType = String(formData.get('grind_type') ?? '').trim() || null
  const frequencyWeeks = Number(formData.get('frequency_weeks'))

  if (!productId) {
    return { error: 'Produit invalide.' }
  }
  if (!Number.isFinite(quantity) || quantity < 1) {
    return { error: 'Quantité invalide.' }
  }
  if (!FREQUENCY_WEEKS.includes(frequencyWeeks as (typeof FREQUENCY_WEEKS)[number])) {
    return { error: 'Fréquence invalide.' }
  }

  const { error } = await supabase.from('product_subscriptions').insert({
    profile_id: userId,
    product_id: productId,
    quantity,
    grind_type: grindType,
    frequency_weeks: frequencyWeeks,
    next_reminder_at: nextReminderDate(frequencyWeeks),
  })

  if (error) {
    console.error('[createSubscription] insert failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  revalidatePath('/compte/abonnements')
  return { success: true }
}

export async function toggleSubscription(id: string, active: boolean) {
  const { supabase, userId } = await requireUserId()

  const { error } = await supabase
    .from('product_subscriptions')
    .update({ active })
    .eq('id', id)
    .eq('profile_id', userId)

  if (error) {
    console.error('[toggleSubscription] update failed:', error)
    throw new Error('Mise à jour impossible.')
  }

  revalidatePath('/compte/abonnements')
}

export async function deleteSubscription(id: string) {
  const { supabase, userId } = await requireUserId()

  const { error } = await supabase
    .from('product_subscriptions')
    .delete()
    .eq('id', id)
    .eq('profile_id', userId)

  if (error) {
    console.error('[deleteSubscription] delete failed:', error)
    throw new Error('Suppression impossible.')
  }

  revalidatePath('/compte/abonnements')
}

// "Commander maintenant" — adds the subscribed line to the cart right away
// (reuses addToCart, so the same active/in_stock guard applies) and pushes
// the schedule out by a full cycle from today, so the automatic reminder
// doesn't also fire right behind it.
export async function reorderSubscriptionNow(id: string) {
  const { supabase, userId } = await requireUserId()

  const { data: subscription, error: fetchError } = await supabase
    .from('product_subscriptions')
    .select('product_id, quantity, grind_type, frequency_weeks')
    .eq('id', id)
    .eq('profile_id', userId)
    .single()

  if (fetchError || !subscription) {
    console.error('[reorderSubscriptionNow] fetch failed:', fetchError)
    throw new Error('Abonnement introuvable.')
  }

  await addToCart(subscription.product_id, subscription.quantity, subscription.grind_type)

  await supabase
    .from('product_subscriptions')
    .update({
      next_reminder_at: nextReminderDate(subscription.frequency_weeks),
      last_reminded_at: new Date().toISOString(),
    })
    .eq('id', id)

  revalidatePath('/compte/abonnements')
  redirect('/compte/panier')
}
