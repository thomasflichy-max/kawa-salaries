import Link from 'next/link'
import { getCreateOrderFormData } from '../create-order-data'
import { CreateOrderForm } from '../create-order-form'

export default async function CreateOrderPage() {
  const { organizations, employeesByOrg, sitesByOrg, catalogByOrg } = await getCreateOrderFormData()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/commandes" className="text-sky-700 hover:underline text-sm">
          ← Retour aux commandes
        </Link>
        <h1 className="text-xl font-bold text-kawa-800 mt-2">Créer une commande</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Pour un salarié déjà inscrit — la commande est enregistrée immédiatement et n&apos;est
          pas une donnée de démonstration.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 p-5">
        <CreateOrderForm
          organizations={organizations}
          employeesByOrg={employeesByOrg}
          sitesByOrg={sitesByOrg}
          catalogByOrg={catalogByOrg}
        />
      </section>
    </div>
  )
}
