import { getActiveProducts } from '@/lib/products'
import { getEmployee } from '@/lib/get-employee'
import { ProductGrid } from '../product-grid'

export default async function MachinesPage() {
  const { coffeeDiscounts } = await getEmployee()
  const products = await getActiveProducts('machine', coffeeDiscounts)

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-kawa-800">Machines reconditionnées</h1>
      <ProductGrid products={products} />
    </div>
  )
}
