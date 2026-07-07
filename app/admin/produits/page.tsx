import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { PRODUCT_CATEGORIES } from '@/lib/product-categories'
import { DeleteProductButton } from './delete-product-button'
import { ToggleActiveButton } from './toggle-active-button'
import { CoffeePricingForm } from '@/app/admin/coffee-pricing-form'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const [{ data: products }, { data: coffeePricing }] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, category, subcategory, tag, name, price, image_url, sort_order, purchasable, active'
      )
      .order('category')
      .order('sort_order')
      .order('name'),
    supabase.from('coffee_pricing').select('subcategory, base_price, discount_percent'),
  ])

  const categoryLabel = new Map<string, string>(PRODUCT_CATEGORIES.map((c) => [c.key, c.label]))
  const allProducts = products ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-kawa-800">Catalogue produits</h1>
          <p className="text-kawa-500 text-sm mt-1">
            Ajoute, modifie ou retire des produits du catalogue salariés.
          </p>
        </div>
        <Link
          href="/admin/produits/nouveau"
          className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition"
        >
          + Ajouter un produit
        </Link>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Tarification des cafés
        </h2>
        <div className="p-5">
          <CoffeePricingForm rules={coffeePricing ?? []} />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-3 font-medium">Produit</th>
                <th className="px-5 py-3 font-medium">Catégorie</th>
                <th className="px-5 py-3 font-medium">Sous-catégorie</th>
                <th className="px-5 py-3 font-medium">Prix</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allProducts.map((product) => (
                <tr key={product.id} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {product.image_url && (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-kawa-50 shrink-0">
                          <Image
                            src={product.image_url}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      )}
                      <span className="text-kawa-800 font-medium">{product.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-kawa-500">
                    {categoryLabel.get(product.category) ?? product.category}
                  </td>
                  <td className="px-5 py-3 text-kawa-500">{product.subcategory ?? '—'}</td>
                  <td className="px-5 py-3 text-kawa-800">
                    {product.price != null ? currency.format(product.price) : 'calculé'}
                  </td>
                  <td className="px-5 py-3">
                    <ToggleActiveButton productId={product.id} active={product.active} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/produits/${product.id}`}
                        className="text-sky-700 hover:underline text-sm"
                      >
                        Modifier
                      </Link>
                      <DeleteProductButton productId={product.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {allProducts.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={6}>
                    Aucun produit pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
