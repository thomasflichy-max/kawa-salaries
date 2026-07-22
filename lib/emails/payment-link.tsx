import type { AdminOrder } from '@/app/admin/commandes/manual-orders'
import {
  KAWA_SKY,
  KAWA_INK,
  KAWA_MUTED,
  currency,
  escapeHtml,
  renderItemsTableRows,
  renderEmailShell,
  renderCtaButton,
  sendOrderEmail,
} from './shared'

// Sent when staff manually create an order (no real checkout pipeline yet —
// see app/admin/commandes/manual-orders.ts) and want the employee to pay via
// a link generated externally (CAWL), pasted into order.paymentLink.
export function renderPaymentLinkEmail(order: AdminOrder) {
  if (!order.paymentLink) {
    throw new Error('renderPaymentLinkEmail: order has no paymentLink set.')
  }
  const firstName = order.employeeName.split(' ')[0] ?? order.employeeName

  const bodyHtml = `
    <p style="margin:0 0 4px;color:${KAWA_SKY};font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
      Commande en attente de paiement
    </p>
    <h1 style="margin:0 0 16px;color:${KAWA_INK};font-size:22px;">
      Plus qu'une étape, ${escapeHtml(firstName)} !
    </h1>
    <p style="margin:0 0 24px;color:${KAWA_MUTED};font-size:14px;line-height:1.6;">
      Votre commande <strong style="color:${KAWA_INK};">${escapeHtml(order.orderNumber)}</strong>
      est prête à être validée. Il ne reste plus qu'à la régler pour qu'on la prépare.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${renderItemsTableRows(order.items)}
      <tr>
        <td colspan="3" style="padding:14px 0 0;color:${KAWA_INK};font-size:15px;font-weight:700;">
          Total TTC
        </td>
        <td style="padding:14px 0 0;color:${KAWA_SKY};font-size:15px;font-weight:700;text-align:right;">
          ${currency.format(order.amount)}
        </td>
      </tr>
    </table>

    ${renderCtaButton('Payer ma commande', order.paymentLink)}
  `

  const text = [
    `Plus qu'une étape, ${firstName} !`,
    '',
    `Votre commande ${order.orderNumber} est prête à être validée.`,
    '',
    ...order.items.map(
      (item) => `- ${item.productName} × ${item.quantity} — ${currency.format(item.unitPriceTTC * item.quantity)}`
    ),
    '',
    `Total TTC : ${currency.format(order.amount)}`,
    '',
    `Payer ma commande : ${order.paymentLink}`,
  ].join('\n')

  return {
    subject: `Réglez votre commande — ${order.orderNumber}`,
    html: renderEmailShell(bodyHtml),
    text,
  }
}

export async function sendPaymentLinkEmail(
  order: AdminOrder,
  overrides?: { to?: string; subjectPrefix?: string }
) {
  const { subject, html, text } = renderPaymentLinkEmail(order)
  await sendOrderEmail({
    to: overrides?.to ?? order.employeeEmail,
    subject: overrides?.subjectPrefix ? `${overrides.subjectPrefix}${subject}` : subject,
    html,
    text,
  })
}
