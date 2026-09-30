import { getActiveProducts, localizeProduct } from '@/lib/products'
import { getEmployee } from '@/lib/get-employee'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { GuideWizard } from './guide-wizard'

export default async function ChoisirSonCafePage() {
  const { coffeeDiscounts } = await getEmployee()
  const locale = await getLocale()
  const t = getDictionary(locale)
  const coffees = (await getActiveProducts('cafe', coffeeDiscounts)).map((p) =>
    localizeProduct(p, locale)
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">{t.produits.chooseCoffeeTitle}</h1>
        <p className="text-kawa-500 mt-1">{t.wizard.intro}</p>
      </div>

      <GuideWizard coffees={coffees} t={t.wizard} produitsT={t.produits} locale={locale} />
    </div>
  )
}
