'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { upsertCartItem } from '@/lib/cart-items'

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

  // The catalog hides the add button for out-of-stock products — this is
  // the server-side backstop (stale page, direct call).
  const { data: product } = await supabase
    .from('products')
    .select('in_stock, active')
    .eq('id', productId)
    .maybeSingle()
  if (!product || !product.active || !product.in_stock) {
    return
  }

  await upsertCartItem(supabase, userId, productId, quantity, grindType)

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
