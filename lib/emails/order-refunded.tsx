import { renderToBuffer } from '@react-pdf/renderer'
import type { DemoOrder, DemoOrderRefund } from '@/app/admin/demo-data'
import { getOrderRefundTotal } from '@/app/admin/demo-data'
import { RefundCertificateDocument } from '@/app/admin/commandes/pdf/refund-certificate-document'
import {
  SITE_URL,
  KAWA_SKY,
  KAWA_INK,
  KAWA_MUTED,
  currency,
  escapeHtml,
  renderEmailShell,
  renderCtaButton,
  sendOrderEmail,
} from './shared'

// Sent every time staff record a refund on an order (partial or full) — see
// refundOrderAction in commandes/actions.ts. Certificate PDF attached, no
// items table: this is about money moving, not about the parcel.
export function renderOrderRefundedEmail(order: DemoOrder, refund: DemoOrderRefund) {
  const firstName = order.employeeName.split(' ')[0] ?? order.employeeName
  const totalRefunded = getOrderRefundTotal(order)
  const isFull = totalRefunded >= order.amount - 0.005

  const bodyHtml = `
    <p style="margin:0 0 4px;color:${KAWA_SKY};font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
      Remboursement confirmé
    </p>
    <h1 style="margin:0 0 16px;color:${KAWA_INK};font-size:22px;">
      Vous avez été remboursé, ${escapeHtml(firstName)}
    </h1>
    <p style="margin:0 0 12px;color:${KAWA_MUTED};font-size:14px;line-height:1.6;">
      Nous avons remboursé <strong style="color:${KAWA_INK};">${currency.format(refund.amount)}</strong>
      au titre de votre commande <strong style="color:${KAWA_INK};">${escapeHtml(order.orderNumber)}</strong>.
    </p>
    <p style="margin:0 0 24px;color:${KAWA_MUTED};font-size:14px;line-height:1.6;">
      Motif : ${escapeHtml(refund.reason)}.
      ${
        isFull
          ? 'Cette commande est désormais intégralement remboursée.'
          : `À ce jour, ${escapeHtml(currency.format(totalRefunded))} ont été remboursés sur ${escapeHtml(currency.format(order.amount))} payés.`
      }
      Vous trouverez le justificatif de ce remboursement en pièce jointe.
    </p>

    ${renderCtaButton('Voir ma commande', `${SITE_URL}/compte/commandes`)}
  `

  const text = [
    `Vous avez été remboursé, ${firstName}.`,
    '',
    `Nous avons remboursé ${currency.format(refund.amount)} au titre de votre commande ${order.orderNumber}.`,
    `Motif : ${refund.reason}.`,
    isFull
      ? 'Cette commande est désormais intégralement remboursée.'
      : `À ce jour, ${currency.format(totalRefunded)} ont été remboursés sur ${currency.format(order.amount)} payés.`,
    '',
    `Voir ma commande : ${SITE_URL}/compte/commandes`,
  ].join('\n')

  return {
    subject: `Remboursement confirmé — ${order.orderNumber}`,
    html: renderEmailShell(bodyHtml),
    text,
  }
}

export async function sendOrderRefundedEmail(
  order: DemoOrder,
  refund: DemoOrderRefund,
  overrides?: { to?: string; subjectPrefix?: string }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[order-refunded] RESEND_API_KEY not set, skipping email send')
    return
  }
  const { subject, html, text } = renderOrderRefundedEmail(order, refund)
  const certificateBuffer = await renderToBuffer(
    <RefundCertificateDocument order={order} refund={refund} />
  )
  await sendOrderEmail({
    to: overrides?.to ?? order.employeeEmail,
    subject: overrides?.subjectPrefix ? `${overrides.subjectPrefix}${subject}` : subject,
    html,
    text,
    attachments: [
      { filename: `justificatif-remboursement-${order.orderNumber}.pdf`, content: certificateBuffer },
    ],
  })
}
