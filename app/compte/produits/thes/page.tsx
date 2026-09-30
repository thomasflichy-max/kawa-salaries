import { getActiveProducts, localizeProduct } from '@/lib/products'
import { getEmployee } from '@/lib/get-employee'
import { PRODUCT_CATEGORIES, categoryLabel } from '@/lib/product-categories'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { ProductGrid } from '../product-grid'

export default async function ThesPage() {
  const { coffeeDiscounts } = await getEmployee()
  const locale = await getLocale()
  const t = getDictionary(locale)
  const products = (await getActiveProducts('the', coffeeDiscounts)).map((p) =>
    localizeProduct(p, locale)
  )
  const category = PRODUCT_CATEGORIES.find((c) => c.key === 'the')!

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-kawa-800">{categoryLabel(category, locale)}</h1>
      <ProductGrid products={products} t={t.produits} />
    </div>
  )
}
