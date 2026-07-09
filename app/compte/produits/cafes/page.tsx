import { getActiveProducts } from '@/lib/products'
import { getEmployee } from '@/lib/get-employee'
import { ProductGrid } from '../product-grid'

export default async function CafesPage() {
  const { coffeeDiscounts } = await getEmployee()
  const products = await getActiveProducts('cafe', coffeeDiscounts)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-kawa-800">Cafés</h1>
      <ProductGrid products={products} />
    </div>
  )
}
