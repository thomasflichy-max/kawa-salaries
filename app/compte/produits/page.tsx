import Link from 'next/link'
import { getActiveProducts } from '@/lib/products'
import { getEmployee } from '@/lib/get-employee'
import { PRODUCT_CATEGORIES } from '@/lib/product-categories'
import { ProductGrid } from './product-grid'

export default async function ProduitsPage() {
  const { coffeeDiscounts } = await getEmployee()
  const products = await getActiveProducts(undefined, coffeeDiscounts)

  const productsByCategory = new Map<string, typeof products>()
  for (const product of products) {
    const list = productsByCategory.get(product.category) ?? []
    list.push(product)
    productsByCategory.set(product.category, list)
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">Produits</h1>
        <p className="text-kawa-500 mt-1">
          Votre remise KAWA est déjà appliquée sur les produits du catalogue.
        </p>
      </div>

      <Link
        href="/compte/produits/choisir-son-cafe"
        className="flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50 hover:bg-sky-100 transition p-5"
      >
        <span className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-2xl shrink-0">
          ☕
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-kawa-800">Choisir son café</span>
          <span className="block text-sm text-kawa-500">
            Pas sûr de la mouture ou du café qu&apos;il vous faut ? Suivez le guide.
          </span>
        </span>
        <span className="text-sky-700 text-lg shrink-0">→</span>
      </Link>

      {PRODUCT_CATEGORIES.map((category) => (
        <section key={category.key}>
          <h2 className="text-lg font-semibold text-kawa-800 mb-4">
            {category.label}
          </h2>
          <ProductGrid products={productsByCategory.get(category.key) ?? []} />
        </section>
      ))}
    </div>
  )
}
