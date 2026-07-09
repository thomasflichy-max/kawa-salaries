'use client'

import { InvoiceIcon, DeliveryNoteIcon } from './document-icons'

const buttonClass =
  'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-kawa-800 text-white hover:bg-kawa-900 transition'

export function DocumentDownloadLinks({ orderId }: { orderId: string }) {
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <a
        href={`/admin/commandes/${orderId}/facture`}
        target="_blank"
        rel="noopener noreferrer"
        title="Télécharger la facture"
        aria-label="Télécharger la facture"
        className={buttonClass}
      >
        <InvoiceIcon />
      </a>
      <a
        href={`/admin/commandes/${orderId}/bon-livraison`}
        target="_blank"
        rel="noopener noreferrer"
        title="Télécharger le bon de livraison"
        aria-label="Télécharger le bon de livraison"
        className={buttonClass}
      >
        <DeliveryNoteIcon />
      </a>
    </div>
  )
}
