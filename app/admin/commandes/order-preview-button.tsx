'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { DemoOrder } from '@/app/admin/demo-data'
import {
  DEMO_ORDER_STATUS_LABELS,
  DEMO_ORDER_STATUS_STYLES,
  getDeliveryLabel,
  getOrderRefundStatus,
} from '@/app/admin/demo-data'

function EyeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="#41b6e6"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.25" fill="#41b6e6" />
    </svg>
  )
}

export function OrderPreviewButton({ order }: { order: DemoOrder }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        title="Aperçu rapide"
        aria-label="Aperçu rapide"
        className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-kawa-100 transition"
      >
        <EyeIcon />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={(e) => {
            e.stopPropagation()
            setOpen(false)
          }}
        >
          <div
            className="bg-white rounded-2xl border border-kawa-200 shadow-lg w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-kawa-200">
              <h2 className="text-sm font-semibold text-kawa-800">
                {order.orderNumber} — {order.organizationName}
              </h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-kawa-400 hover:text-kawa-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-sm max-h-[70vh] overflow-y-auto">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-kawa-500 mb-1">Adresse de facturation</p>
                  <p className="text-kawa-800">{order.billingAddress}</p>
                </div>
                <div>
                  <p className="text-kawa-500 mb-1">Adresse de livraison</p>
                  <p className="text-kawa-800">{getDeliveryLabel(order)}</p>
                </div>
                <div>
                  <p className="text-kawa-500 mb-1">Email</p>
                  <p className="text-kawa-800">{order.employeeEmail}</p>
                </div>
                <div>
                  <p className="text-kawa-500 mb-1">Téléphone</p>
                  <p className="text-kawa-800">{order.employeePhone}</p>
                </div>
                <div>
                  <p className="text-kawa-500 mb-1">Mode de livraison</p>
                  <p className="text-kawa-800">
                    {order.deliveryMode === 'pickup' ? 'Retrait KAWA Nantes' : 'Livraison chez le client'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-kawa-500 mb-2">Produits</p>
                <ul className="flex flex-col gap-2">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-kawa-50 shrink-0">
                        <Image
                          src={item.imageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <span className="flex-1 text-kawa-800">{item.productName}</span>
                      <span className="text-kawa-500">× {item.quantity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-t border-kawa-200">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${DEMO_ORDER_STATUS_STYLES[order.status]}`}
                >
                  {DEMO_ORDER_STATUS_LABELS[order.status]}
                </span>
                {getOrderRefundStatus(order) !== 'none' && (
                  <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">
                    {getOrderRefundStatus(order) === 'full' ? 'Remboursée' : 'Remb. partiel'}
                  </span>
                )}
              </div>
              <button
                onClick={() => router.push(`/admin/commandes/${order.id}`)}
                className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
