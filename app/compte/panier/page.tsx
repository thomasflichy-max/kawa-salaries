import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getEmployee } from '@/lib/get-employee'
import { updateCartItemQuantity, removeCartItem } from '@/app/actions/cart'
import { resolveProductPricing } from '@/lib/products'
import { getCoffeePricing } from '@/lib/coffee-pricing'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const GRIND_LABELS: Record<string, string> = {
  grain: 'En grains',
  filtre: 'Moulu filtre',
  espresso: 'Moulu espresso',
}

export default async function PanierPage() {
  const { user, organization, coffeeDiscounts } = await getEmployee()
  const supabase = await createClient()

  const { data: items, error } = await supabase
    .from('cart_items')
    .select(
      'id, quantity, grind_type, product:products(id, name, price, image_url, category, subcategory)'
    )
    .eq('user_id', user.id)
    .order('created_at')

  if (error) {
    console.error('[panier] failed to load cart:', error)
  }

  const pricingRules = await getCoffeePricing()
  const cartItems = (items ?? []).map((item) => {
    const { price, basePrice } = item.product
      ? resolveProductPricing(item.product, pricingRules, coffeeDiscounts)
      : { price: 0, basePrice: null }
    return { ...item, unitPrice: price ?? 0, baseUnitPrice: basePrice }
  })
  const total = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const savings = cartItems.reduce((sum, item) => {
    if (item.baseUnitPrice == null) return sum
    return sum + (item.baseUnitPrice - item.unitPrice) * item.quantity
  }, 0)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">Mon Panier</h1>
        <p className="text-kawa-500 mt-1">Votre sélection de produits.</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-kawa-200 p-10 text-center">
          <p className="text-kawa-500">Votre panier est vide.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
          <ul className="divide-y divide-kawa-100">
            {cartItems.map((item) => (
              <li key={item.id} className="flex items-center gap-4 p-5">
                <div className="relative w-16 h-16 shrink-0 bg-kawa-50 rounded-lg overflow-hidden">
                  {item.product?.image_url && (
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-medium text-kawa-800">
                    {item.product?.name ?? '—'}
                    {item.product?.category === 'cafe' && (
                      <span className="text-kawa-500 font-normal">
                        {' '}
                        — {GRIND_LABELS[item.grind_type ?? 'grain'] ?? item.grind_type}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-kawa-500">
                    {currency.format(item.unitPrice)}
                    {item.baseUnitPrice != null && ' / kg'}
                  </p>
                </div>

                <form
                  action={updateCartItemQuantity.bind(null, item.id, item.quantity - 1)}
                >
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full border border-kawa-200 text-kawa-600 hover:bg-kawa-50 transition"
                  >
                    −
                  </button>
                </form>
                <span className="w-6 text-center text-kawa-800 font-medium">
                  {item.quantity}
                </span>
                <form
                  action={updateCartItemQuantity.bind(null, item.id, item.quantity + 1)}
                >
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full border border-kawa-200 text-kawa-600 hover:bg-kawa-50 transition"
                  >
                    +
                  </button>
                </form>

                <p className="w-24 text-right font-semibold text-kawa-800">
                  {currency.format(item.unitPrice * item.quantity)}
                </p>

                <form action={removeCartItem.bind(null, item.id)}>
                  <button
                    type="submit"
                    className="text-sm text-red-600 hover:underline"
                  >
                    Retirer
                  </button>
                </form>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-2 p-5 border-t border-kawa-100 bg-kawa-50">
            {savings > 0 && (
              <p className="flex items-center justify-between text-sm text-emerald-700">
                <span>
                  Économisé grâce à la remise {organization?.name ?? 'entreprise'}
                </span>
                <span className="font-semibold">{currency.format(savings)}</span>
              </p>
            )}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-kawa-800">Total</p>
              <p className="text-xl font-bold text-sky-700">{currency.format(total)} TTC</p>
            </div>
          </div>

          <div className="p-5 border-t border-kawa-100">
            <button
              disabled
              className="w-full bg-kawa-200 text-kawa-500 py-3 rounded-lg font-medium cursor-not-allowed"
            >
              Passer commande — paiement bientôt disponible
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
