import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import {
  DEMO_ORDER_STATUS_LABELS,
  DEMO_ORDER_STATUS_STYLES,
  DEMO_NOTICE,
  getDeliveryLabel,
  getDemoOrderById,
} from '@/app/admin/demo-data'
import { DemoBadge } from '@/app/admin/demo-badge'
import { StatusUpdateForm } from '../status-update-form'
import { EditableAddressField } from '../editable-address-field'
import { InvoiceIcon, DeliveryNoteIcon } from '../document-icons'
import { RefundOrderButton } from '../refund-order-button'
import {
  updateOrderBillingAddressAction,
  updateOrderShippingAddressAction,
} from '../actions'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})
const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
})

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = getDemoOrderById(id)

  if (!order) {
    notFound()
  }

  const shippingValue =
    order.deliveryMode === 'pickup' ? getDeliveryLabel(order) : order.address

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin/commandes" className="text-sky-700 hover:underline text-sm">
            ← Retour aux commandes
          </Link>
          <h1 className="text-xl font-bold text-kawa-800 mt-2">{order.orderNumber}</h1>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/admin/commandes/${order.id}/facture`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-kawa-800 text-white px-4 py-2 text-sm font-medium hover:bg-kawa-900 transition"
          >
            <InvoiceIcon />
            Facture PDF
          </a>
          <a
            href={`/admin/commandes/${order.id}/bon-livraison`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-kawa-800 text-white px-4 py-2 text-sm font-medium hover:bg-kawa-900 transition"
          >
            <DeliveryNoteIcon />
            Bon de livraison PDF
          </a>
        </div>
      </div>

      <DemoBadge text={DEMO_NOTICE} />

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Détail de la commande
        </h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 p-5 text-sm">
          <div>
            <dt className="text-kawa-500">Salarié</dt>
            <dd className="text-kawa-800 mt-0.5">{order.employeeName}</dd>
          </div>
          <div>
            <dt className="text-kawa-500">Entreprise</dt>
            <dd className="text-kawa-800 mt-0.5">{order.organizationName}</dd>
          </div>
          <div>
            <dt className="text-kawa-500">Passée le</dt>
            <dd className="text-kawa-800 mt-0.5">{dateFormat.format(new Date(order.createdAt))}</dd>
          </div>
          <div>
            <dt className="text-kawa-500">Montant TTC</dt>
            <dd className="text-kawa-800 mt-0.5 font-semibold">{currency.format(order.amount)}</dd>
          </div>
          <div>
            <dt className="text-kawa-500">Livraison</dt>
            <dd className="text-kawa-800 mt-0.5">
              {order.deliveryMode === 'pickup' ? 'Retrait KAWA Nantes' : 'Livraison chez le client'}
            </dd>
          </div>
          <div>
            <dt className="text-kawa-500 mb-1">Statut actuel</dt>
            <dd className="mt-0.5">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${DEMO_ORDER_STATUS_STYLES[order.status]}`}
              >
                {DEMO_ORDER_STATUS_LABELS[order.status]}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-kawa-500 mb-1">Remboursement</dt>
            <dd className="mt-0.5">
              {order.refundedAt ? (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                  Remboursée le {dateFormat.format(new Date(order.refundedAt))}
                </span>
              ) : (
                <span className="text-kawa-400 text-sm">Aucun</span>
              )}
            </dd>
          </div>
        </dl>
        <div className="px-5 pb-5 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium text-kawa-700 mb-2">Changer le statut</p>
            <StatusUpdateForm orderId={order.id} status={order.status} />
            <p className="text-xs text-kawa-400 mt-2">
              Seul un administrateur peut confirmer l&apos;annulation — le salarié peut uniquement
              en faire la demande.
            </p>
          </div>
          {!order.refundedAt && (
            <div>
              <p className="text-sm font-medium text-kawa-700 mb-2">Remboursement</p>
              <RefundOrderButton orderId={order.id} />
              <p className="text-xs text-kawa-400 mt-2">
                Ne déclenche aucun virement — il n&apos;y a pas encore de module de paiement. Ça
                garde juste une trace de qui a remboursé et quand.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-kawa-100">
          <div className="p-5">
            <EditableAddressField
              label="Facturation"
              value={order.billingAddress}
              editable
              onSave={async (value) => {
                'use server'
                await updateOrderBillingAddressAction(order.id, value)
              }}
            />
          </div>
          <div className="p-5">
            <EditableAddressField
              label="Livraison"
              value={shippingValue}
              editable={order.deliveryMode === 'delivery'}
              onSave={async (value) => {
                'use server'
                await updateOrderShippingAddressAction(order.id, value)
              }}
            />
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Articles commandés
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-3 font-medium">Produit</th>
                <th className="px-5 py-3 font-medium text-right">Quantité</th>
                <th className="px-5 py-3 font-medium text-right">Prix unitaire TTC</th>
                <th className="px-5 py-3 font-medium text-right">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.productName} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3 text-kawa-800">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-kawa-50 shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      {item.productName}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-kawa-500 text-right">{item.quantity}</td>
                  <td className="px-5 py-3 text-kawa-500 text-right">
                    {currency.format(item.unitPriceTTC)}
                  </td>
                  <td className="px-5 py-3 text-kawa-800 text-right font-medium">
                    {currency.format(item.unitPriceTTC * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-5 py-3 text-right text-kawa-500 font-medium">
                  Total TTC
                </td>
                <td className="px-5 py-3 text-right text-kawa-800 font-semibold">
                  {currency.format(order.amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Historique
        </h2>
        <ul className="p-5 flex flex-col gap-3 text-sm">
          {[...order.history].reverse().map((entry, i) => (
            <li key={i} className="border-l-2 border-sky-200 pl-3">
              <p className="text-kawa-800">{entry.action}</p>
              <p className="text-xs text-kawa-400">
                {dateFormat.format(new Date(entry.at))} par {entry.actor}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
