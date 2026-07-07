import { getEmployee } from '@/lib/get-employee'

export default async function AvantagePage() {
  const { organization } = await getEmployee()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">Votre Avantage</h1>
        <p className="text-kawa-500 mt-1">
          Ce que {organization?.name ?? 'votre entreprise'} vous fait gagner chez kawa.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-kawa-200 p-8 flex flex-col gap-6 max-w-2xl">
        <div className="flex items-center justify-between border-b border-kawa-100 pb-6">
          <div>
            <p className="font-semibold text-kawa-800">Remise sur le café</p>
            <p className="text-sm text-kawa-500 mt-1">
              Appliquée automatiquement sur toutes vos commandes de café, produits
              d&apos;entretien et machines reconditionnées.
            </p>
          </div>
          <span className="bg-sky-500 text-kawa-950 font-bold text-xl px-4 py-1 rounded-full whitespace-nowrap">
            {organization?.discount_rate != null ? `${organization.discount_rate}%` : '—'}
          </span>
        </div>

        <div>
          <p className="font-semibold text-kawa-800">Conditions de livraison</p>
          <p className="text-sm text-kawa-500 mt-1">
            Livraison offerte dès 50€ d&apos;achat, sous 2 à 4 jours ouvrés partout en
            France. En dessous de ce montant, des frais de livraison forfaitaires
            s&apos;appliquent au moment de la commande.
          </p>
        </div>
      </div>
    </div>
  )
}
