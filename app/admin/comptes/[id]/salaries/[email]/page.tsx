import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  DEMO_ORDERS,
  DEMO_ORDER_STATUS_LABELS,
  DEMO_ORDER_STATUS_STYLES,
  DEMO_NOTICE,
  getDeliveryLabel,
} from '@/app/admin/demo-data'
import { DemoBadge } from '@/app/admin/demo-badge'
import { DocumentDownloadLinks } from '@/app/admin/commandes/document-download-links'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

export default async function AdminEmployeeDetailPage({
  params,
}: {
  params: Promise<{ id: string; email: string }>
}) {
  const { id, email: encodedEmail } = await params
  const email = decodeURIComponent(encodedEmail)
  const supabase = await createClient()

  const [{ data: org }, { data: employee }] = await Promise.all([
    supabase.from('organizations').select('id, name').eq('id', id).maybeSingle(),
    supabase
      .from('profiles')
      .select('id, full_name, email, organization_id, created_at')
      .eq('organization_id', id)
      .eq('email', email)
      .maybeSingle(),
  ])

  if (!org) {
    notFound()
  }

  // Orders aren't wired to real profiles yet (no checkout pipeline) — matched
  // here by email, same as everywhere else demo orders are looked up. A real
  // employee's email won't match any of the fictional demo order emails, so
  // this legitimately shows "no orders" until a real orders table exists.
  // Keyed by email (not a profile id) so this page also works for a
  // "Salarié ayant commandé" that only exists in the demo order data, with
  // no matching profiles row.
  const orders = DEMO_ORDERS.filter((order) => order.employeeEmail === email).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (!employee && orders.length === 0) {
    notFound()
  }

  const displayName = employee?.full_name ?? orders[0]?.employeeName ?? email
  const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/admin/comptes/${org.id}`} className="text-sky-700 hover:underline text-sm">
          ← Retour à {org.name}
        </Link>
        <h1 className="text-xl font-bold text-kawa-800 mt-2">{displayName}</h1>
        <p className="text-kawa-500 text-sm mt-1">{email}</p>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <dl className="grid sm:grid-cols-3 gap-x-6 gap-y-4 p-5 text-sm">
          <div>
            <dt className="text-kawa-500">Entreprise</dt>
            <dd className="text-kawa-800 mt-0.5">{org.name}</dd>
          </div>
          <div>
            <dt className="text-kawa-500">Inscrit le</dt>
            <dd className="text-kawa-800 mt-0.5">
              {employee?.created_at
                ? dateFormat.format(new Date(employee.created_at))
                : 'Pas encore de compte'}
            </dd>
          </div>
          <div>
            <dt className="text-kawa-500">Total dépensé TTC</dt>
            <dd className="text-kawa-800 mt-0.5 font-semibold">{currency.format(totalSpent)}</dd>
          </div>
        </dl>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-kawa-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-kawa-800">Historique des commandes</h2>
          <DemoBadge text={DEMO_NOTICE} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Livraison</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium text-right">Montant TTC</th>
                <th className="px-5 py-3 font-medium text-right">Documents</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3 text-kawa-500 whitespace-nowrap">
                    <Link href={`/admin/commandes/${order.id}`} className="text-sky-700 hover:underline">
                      {order.orderNumber}
                    </Link>
                    <span className="block text-xs text-kawa-400">
                      {dateFormat.format(new Date(order.createdAt))}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-kawa-500 max-w-[220px]">{getDeliveryLabel(order)}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${DEMO_ORDER_STATUS_STYLES[order.status]}`}
                    >
                      {DEMO_ORDER_STATUS_LABELS[order.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-kawa-800 text-right whitespace-nowrap">
                    {currency.format(order.amount)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end">
                      <DocumentDownloadLinks orderId={order.id} />
                    </div>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={5}>
                    Aucune commande pour ce salarié pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
