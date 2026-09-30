import Link from 'next/link'
import { getActiveProducts, localizeProduct } from '@/lib/products'
import { getEmployee } from '@/lib/get-employee'
import { PRODUCT_CATEGORIES, categoryLabel } from '@/lib/product-categories'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { ProductGrid } from './product-grid'

export default async function ProduitsPage() {
  const { coffeeDiscounts } = await getEmployee()
  const locale = await getLocale()
  const t = getDictionary(locale)
  const products = (await getActiveProducts(undefined, coffeeDiscounts)).map((p) =>
    localizeProduct(p, locale)
  )

  const productsByCategory = new Map<string, typeof products>()
  for (const product of products) {
    const list = productsByCategory.get(product.category) ?? []
    list.push(product)
    productsByCategory.set(product.category, list)
  }

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">{t.produits.pageTitle}</h1>
        <p className="text-kawa-500 mt-1">{t.produits.pageSubtitle}</p>
      </div>

      <Link
        href="/compte/produits/choisir-son-cafe"
        className="flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50 hover:bg-sky-100 transition p-5"
      >
        <span className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-2xl shrink-0">
          ☕
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-kawa-800">{t.produits.chooseCoffeeTitle}</span>
          <span className="block text-sm text-kawa-500">{t.produits.chooseCoffeeSubtitle}</span>
        </span>
        <span className="text-sky-700 text-lg shrink-0">→</span>
      </Link>

      {PRODUCT_CATEGORIES.map((category) => (
        <section key={category.key}>
          <h2 className="text-lg font-semibold text-kawa-800 mb-4">
            {categoryLabel(category, locale)}
          </h2>
          <ProductGrid products={productsByCategory.get(category.key) ?? []} t={t.produits} />
        </section>
      ))}
    </div>
  )
}
