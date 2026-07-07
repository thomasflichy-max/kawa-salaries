'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function requireUserId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion?next=/compte/panier')
  }

  return { supabase, userId: user.id }
}

export async function addToCart(
  productId: string,
  quantity = 1,
  grindType: string | null = null
) {
  const { supabase, userId } = await requireUserId()

  let existingQuery = supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)

  existingQuery = grindType
    ? existingQuery.eq('grind_type', grindType)
    : existingQuery.is('grind_type', null)

  const { data: existing } = await existingQuery.maybeSingle()

  if (existing) {
    await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity, grind_type: grindType })
  }

  revalidatePath('/compte/panier')
  revalidatePath('/compte/produits')
  revalidatePath('/compte', 'layout')
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const { supabase, userId } = await requireUserId()

  if (quantity <= 0) {
    await supabase.from('cart_items').delete().eq('id', itemId).eq('user_id', userId)
  } else {
    await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .eq('user_id', userId)
  }

  revalidatePath('/compte/panier')
  revalidatePath('/compte', 'layout')
}

export async function removeCartItem(itemId: string) {
  const { supabase, userId } = await requireUserId()

  await supabase.from('cart_items').delete().eq('id', itemId).eq('user_id', userId)

  revalidatePath('/compte/panier')
  revalidatePath('/compte', 'layout')
}
