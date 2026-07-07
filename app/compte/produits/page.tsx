import { getActiveProducts } from '@/lib/products'
import { PRODUCT_CATEGORIES } from '@/lib/product-categories'
import { ProductGrid } from './product-grid'

export default async function ProduitsPage() {
  const products = await getActiveProducts()

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
          Votre remise kawa est appliquée automatiquement à la commande.
        </p>
      </div>

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
