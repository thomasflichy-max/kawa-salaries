'use client'

import { InvoiceIcon, DeliveryNoteIcon } from './document-icons'
import { Tooltip } from '@/app/admin/tooltip'

const buttonClass =
  'inline-flex items-center justify-center w-8 h-8 rounded-lg bg-kawa-800 text-white hover:bg-kawa-900 transition'

export function DocumentDownloadLinks({ orderId }: { orderId: string }) {
  return (
    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <Tooltip label="PDF Facture" align="right">
        <a
          href={`/admin/commandes/${orderId}/facture`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Télécharger la facture"
          className={buttonClass}
        >
          <InvoiceIcon />
        </a>
      </Tooltip>
      <Tooltip label="PDF Bon de livraison" align="right">
        <a
          href={`/admin/commandes/${orderId}/bon-livraison`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Télécharger le bon de livraison"
          className={buttonClass}
        >
          <DeliveryNoteIcon />
        </a>
      </Tooltip>
    </div>
  )
}
