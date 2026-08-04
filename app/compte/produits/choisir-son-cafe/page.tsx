import { getActiveProducts } from '@/lib/products'
import { getEmployee } from '@/lib/get-employee'
import { GuideWizard } from './guide-wizard'

export default async function ChoisirSonCafePage() {
  const { coffeeDiscounts } = await getEmployee()
  const coffees = await getActiveProducts('cafe', coffeeDiscounts)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">Choisir son café</h1>
        <p className="text-kawa-500 mt-1">
          Un petit guide pour trouver la mouture et le café adaptés à votre machine, en 3 étapes.
        </p>
      </div>

      <GuideWizard coffees={coffees} />
    </div>
  )
}
