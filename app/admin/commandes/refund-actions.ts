'use server'

import { createClient } from '@/lib/supabase/server'
import {
  getDemoOrderById,
  addDemoOrderRefund,
  getOrderRefundTotal,
  getOrderRefundStatus,
} from '@/app/admin/demo-data'
import { getAdminOrderById } from './manual-orders'
import { archiveOrderInvoiceAndDeliveryNote, archiveRefundCertificate } from '@/lib/order-documents'
import { refundPayment } from '@/lib/cawl'
import { sendOrderRefundedEmail } from '@/lib/emails/order-refunded'
import { requireKawaStaffActor, revalidateOrderPaths } from './actions-helpers'

// Deliberately kept OUT of actions.tsx: this file (via lib/order-documents.tsx)
// imports @react-pdf/renderer and sharp (for PDF/image work), and actions.tsx
// is imported at the top level by app/admin/commandes/[id]/page.tsx (a Server
// Component) for its lightweight address/status actions — that eager import
// was pulling sharp's native binary into every order-detail page render,
// which started crashing in production ("Could not load the sharp module
// using the linux-x64 runtime") even though nothing on that page actually
// generates a PDF. Splitting this out means sharp is only ever loaded when a
// refund/regenerate action actually runs, not just by viewing the page.
export type RefundOrderResult = { ok: true } | { ok: false; error: string }

// Returns a result object instead of throwing — Next.js redacts thrown
// Server Action errors in production ("An error occurred in the Server
// Components render..."), which silently hid every failure message here
// (invalid amount, CAWL API failure, etc.) behind a useless generic error.
export async function refundOrderAction(
  orderId: string,
  amount: number,
  reason: string
): Promise<RefundOrderResult> {
  const actor = await requireKawaStaffActor()
  const trimmedReason = reason.trim()
  if (!(amount > 0) || !trimmedReason) {
    return { ok: false, error: 'Montant et motif requis.' }
  }

  const demoOrder = getDemoOrderById(orderId)
  if (demoOrder) {
    const order = addDemoOrderRefund(orderId, amount, trimmedReason, actor)
    if (!order) {
      return { ok: false, error: 'Montant invalide (dépasse le solde restant à rembourser).' }
    }
    const refund = order.refunds[order.refunds.length - 1]
    try {
      await sendOrderRefundedEmail(order, refund)
    } catch (error) {
      console.error('[commandes] refund confirmation email failed:', error)
    }
    revalidateOrderPaths(orderId)
    return { ok: true }
  }

  const order = await getAdminOrderById(orderId)
  if (!order) {
    return { ok: false, error: 'Commande introuvable.' }
  }
  const remaining = order.amount - getOrderRefundTotal(order)
  if (amount > remaining + 0.005) {
    return { ok: false, error: 'Montant invalide (dépasse le solde restant à rembourser).' }
  }

  // Real (CAWL) orders: actually move the money back to the card BEFORE
  // recording anything — a manual order was never charged through CAWL
  // (paid by virement/lien_cb/boutique instead), so there's nothing to call
  // there. If the CAWL call fails, stop immediately and record nothing:
  // recording a refund that never actually happened would be worse than
  // this button silently doing nothing (previous behaviour), since staff
  // would trust the record. See lib/cawl.ts refundPayment().
  if (order.source === 'real') {
    if (!order.cawlPaymentId) {
      return { ok: false, error: 'Identifiant de paiement CAWL manquant sur cette commande.' }
    }
    try {
      await refundPayment({ cawlPaymentId: order.cawlPaymentId, amount })
    } catch (cawlError) {
      console.error('[commandes] CAWL refundPayment failed:', cawlError)
      return {
        ok: false,
        error:
          'Le remboursement CAWL a échoué, merci de réessayer ou de le faire manuellement sur le back-office CAWL.',
      }
    }
  }

  const supabase = await createClient()
  const { data: refundRow, error } = await supabase
    .from('order_refunds')
    .insert({ order_id: orderId, amount, reason: trimmedReason, actor })
    .select('id, amount, reason, actor, at')
    .single()
  if (error || !refundRow) {
    console.error('[commandes] refund insert failed:', error)
    return { ok: false, error: 'Une erreur est survenue, merci de réessayer.' }
  }

  const orderWithNewRefund = { ...order, refunds: [...order.refunds, refundRow] }
  const isFull = getOrderRefundStatus(orderWithNewRefund) === 'full'
  const amountLabel = amount.toFixed(2).replace('.', ',')
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    actor,
    action: `Remboursement ${isFull ? 'total' : 'partiel'} de ${amountLabel} € — ${trimmedReason}`,
  })

  // Dedicated, gapless AVOIR-{year}-{seq} reference + immutable archived
  // PDF (migration 0032) — same reasoning as the facture/BL in the CAWL
  // webhook: never let a later edit change what was actually issued. A
  // failure here logs a security_event + push notification (see
  // lib/order-documents.tsx) instead of silently leaving a burned sequence
  // number — staff can retry via the "Régénérer" button on the order page.
  const archiveResult = await archiveRefundCertificate(supabase, orderId, refundRow.id)
  if (!archiveResult.ok) {
    console.error('[commandes] refund certificate archiving failed:', archiveResult.error)
  }

  try {
    await sendOrderRefundedEmail(order, refundRow)
  } catch (error) {
    console.error('[commandes] refund confirmation email failed:', error)
  }
  revalidateOrderPaths(orderId)
  return { ok: true }
}

export type RegenerateDocumentResult = { ok: true } | { ok: false; error: string }

// Manual recovery for the (rare) case where minting a facture/BL number
// succeeded but rendering/uploading the PDF failed right after — see
// lib/order-documents.tsx. Safe to call repeatedly: each retry mints a
// fresh number rather than reusing the burned one, since the sequence must
// stay strictly increasing.
export async function regenerateOrderDocumentsAction(
  orderId: string
): Promise<RegenerateDocumentResult> {
  await requireKawaStaffActor()
  const supabase = await createClient()
  const result = await archiveOrderInvoiceAndDeliveryNote(supabase, orderId)
  revalidateOrderPaths(orderId)
  return result.ok ? { ok: true } : { ok: false, error: result.error }
}

export async function regenerateRefundCertificateAction(
  orderId: string,
  refundId: string
): Promise<RegenerateDocumentResult> {
  await requireKawaStaffActor()
  const supabase = await createClient()
  const result = await archiveRefundCertificate(supabase, orderId, refundId)
  revalidateOrderPaths(orderId)
  return result
}
