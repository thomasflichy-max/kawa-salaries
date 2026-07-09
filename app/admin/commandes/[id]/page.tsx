import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  DEMO_ORDER_STATUS_LABELS,
  DEMO_ORDER_STATUS_STYLES,
  DEMO_NOTICE,
  getDeliveryLabel,
  getDemoOrderById,
  getOrderRefundStatus,
} from '@/app/admin/demo-data'
import { DemoBadge } from '@/app/admin/demo-badge'
import { StatusUpdateForm } from '../status-update-form'
import { EditableAddressField } from '../editable-address-field'
import { InvoiceIcon, DeliveryNoteIcon } from '../document-icons'
import { RefundForm } from '../refund-form'
import { OrderItemsEditor, type CatalogProduct } from '../order-items-editor'
import { TestConfirmationEmailButton } from '../test-confirmation-email-button'
import { getActiveProducts } from '@/lib/products'
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
  const refundStatus = getOrderRefundStatus(order)

  const catalogProducts: CatalogProduct[] = (await getActiveProducts()).map((product) => ({
    id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    imageUrl: product.image_url,
  }))

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
              {refundStatus === 'none' && <span className="text-kawa-400 text-sm">Aucun</span>}
              {refundStatus === 'partial' && (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                  Partiellement remboursée
                </span>
              )}
              {refundStatus === 'full' && (
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                  Intégralement remboursée
                </span>
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
          <div>
            <p className="text-sm font-medium text-kawa-700 mb-2">Remboursement</p>
            <RefundForm orderId={order.id} amount={order.amount} items={order.items} refunds={order.refunds} />
          </div>
          <div>
            <p className="text-sm font-medium text-kawa-700 mb-2">Mail de confirmation</p>
            <TestConfirmationEmailButton orderId={order.id} />
            <p className="text-xs text-kawa-400 mt-2">
              Envoie le mail de confirmation à ton adresse plutôt qu&apos;à celle (fictive) du
              salarié, pour prévisualiser la forme avant qu&apos;il soit branché sur une vraie
              commande passée.
            </p>
          </div>
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

      <OrderItemsEditor
        orderId={order.id}
        items={order.items}
        amount={order.amount}
        products={catalogProducts}
      />

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
