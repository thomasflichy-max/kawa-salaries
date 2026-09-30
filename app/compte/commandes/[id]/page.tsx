import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getEmployee } from '@/lib/get-employee'
import {
  DEMO_ORDER_STATUS_STYLES,
  getDeliveryLabel,
  orderStatusLabel,
} from '@/app/admin/demo-data'
import { getAdminOrderById } from '@/app/admin/commandes/manual-orders'
import { InvoiceIcon } from '@/app/admin/commandes/document-icons'
import { OrderContactButton } from '../order-contact-button'
import { PickupScheduler } from '@/app/retrait/pickup-scheduler'
import { upcomingWeekdays } from '@/lib/pickup-slot'
import { KAWA_OFFICE } from '@/app/admin/demo-data'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export default async function CommandeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { user } = await getEmployee()
  const locale = await getLocale()
  const t = getDictionary(locale)
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
  })
  const order = await getAdminOrderById(id)

  // RLS already scopes getAdminOrderById to the caller's own orders for
  // manual/real sources, but demo orders live in memory with no RLS at all
  // — this ownership check is the actual gate for those, and a harmless
  // defense-in-depth check for the other two.
  if (!order || order.employeeEmail !== user.email) {
    notFound()
  }

  const totalRefunded = order.refunds.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/compte/commandes" className="text-sky-700 hover:underline text-sm">
          {t.commandes.backToOrders}
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap mt-2">
          <div>
            <h1 className="text-2xl font-bold text-kawa-800">{order.orderNumber}</h1>
            <p className="text-kawa-500 mt-1">
              {dateFormat.format(new Date(order.createdAt))}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${DEMO_ORDER_STATUS_STYLES[order.status]}`}
            >
              {orderStatusLabel(order.status, locale)}
            </span>
            {order.paid && (
              <a
                href={`/compte/commandes/${order.id}/facture`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-kawa-800 text-white px-4 py-2 text-sm font-medium hover:bg-kawa-900 transition"
              >
                <InvoiceIcon />
                {t.commandes.invoicePdf}
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <ul className="divide-y divide-kawa-100">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-5">
              <div className="relative w-16 h-16 shrink-0 bg-kawa-50 rounded-lg overflow-hidden">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-kawa-800">{item.productName}</p>
                <p className="text-sm text-kawa-500">
                  {currency.format(item.unitPriceTTC)} × {item.quantity}
                  {item.unit === 'Kg' && ' kg'}
                </p>
              </div>
              <p className="font-semibold text-kawa-800">
                {currency.format(item.unitPriceTTC * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-2 p-5 border-t border-kawa-100 bg-kawa-50">
          {totalRefunded > 0 && (
            <p className="flex items-center justify-between text-sm text-red-700">
              <span>{t.commandes.refunded}</span>
              <span className="font-semibold">{currency.format(totalRefunded)}</span>
            </p>
          )}
          <div className="flex items-center justify-between">
            <p className="font-semibold text-kawa-800">{t.panier.total}</p>
            <p className="text-xl font-bold text-sky-700">
              {currency.format(order.amount)} {t.panier.ttc}
            </p>
          </div>
        </div>
      </div>

      {order.deliveryMode === 'pickup' &&
        order.pickupToken &&
        order.status !== 'annulee' &&
        order.status !== 'livree' && (
        <div className="bg-white rounded-2xl border border-kawa-200 p-5 flex flex-col gap-4">
          <div>
            <p className="font-semibold text-kawa-800">{t.commandes.pickupSlotTitle}</p>
            <p className="text-sm text-kawa-500 mt-1">
              {t.commandes.pickupSlotBody(KAWA_OFFICE.address)}
            </p>
          </div>
          <PickupScheduler
            token={order.pickupToken}
            dates={upcomingWeekdays(30)}
            currentDate={order.pickupSlotDate ?? null}
            currentHour={order.pickupSlotHour ?? null}
            t={t.pickupScheduler}
            locale={locale}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-kawa-200 p-5 grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-sm text-kawa-500 mb-1">{t.commandes.deliveryLabel}</p>
          <p className="text-kawa-800">{getDeliveryLabel(order, locale)}</p>
        </div>
        <div>
          <p className="text-sm text-kawa-500 mb-1">{t.commandes.billingAddressLabel}</p>
          <p className="text-kawa-800 whitespace-pre-line">{order.billingAddress}</p>
        </div>
        <div>
          <p className="text-sm text-kawa-500 mb-1">{t.commandes.paymentLabel}</p>
          <p className="text-kawa-800">{order.paid ? t.commandes.paid : t.commandes.notPaid}</p>
        </div>
      </div>

      <OrderContactButton orderNumber={order.orderNumber} t={t.orderContact} supportT={t.support} />
    </div>
  )
}
