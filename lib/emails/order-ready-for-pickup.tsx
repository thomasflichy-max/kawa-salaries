import type { DemoOrder } from '@/app/admin/demo-data'
import { KAWA_OFFICE } from '@/app/admin/demo-data'
import {
  SITE_URL,
  KAWA_SKY,
  KAWA_INK,
  KAWA_MUTED,
  KAWA_BG,
  PICKUP_HOURS_NOTE,
  escapeHtml,
  renderItemsTableRows,
  renderEmailShell,
  renderCtaButton,
  sendOrderEmail,
} from './shared'

// Only meaningful for pickup orders — sent when staff mark the order "prêt à
// l'envoi", separately from the initial order confirmation (no invoice
// re-attached here, it was already sent with the confirmation email).
export function renderOrderReadyForPickupEmail(order: DemoOrder) {
  const firstName = order.employeeName.split(' ')[0] ?? order.employeeName

  const bodyHtml = `
    <p style="margin:0 0 4px;color:${KAWA_SKY};font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
      Commande prête
    </p>
    <h1 style="margin:0 0 16px;color:${KAWA_INK};font-size:22px;">
      Votre commande est prête, ${escapeHtml(firstName)} !
    </h1>
    <p style="margin:0 0 24px;color:${KAWA_MUTED};font-size:14px;line-height:1.6;">
      Bonne nouvelle : votre commande <strong style="color:${KAWA_INK};">${escapeHtml(order.orderNumber)}</strong>
      est prête et vous attend chez KAWA Nantes.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${renderItemsTableRows(order.items)}
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${KAWA_BG};border-radius:12px;">
      <tr>
        <td style="padding:16px 20px 4px;">
          <p style="margin:0 0 2px;color:${KAWA_MUTED};font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">
            Retrait
          </p>
          <p style="margin:0;color:${KAWA_INK};font-size:14px;">${escapeHtml(KAWA_OFFICE.address)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 16px;">
          <p style="margin:0;color:${KAWA_MUTED};font-size:13px;line-height:1.5;">${escapeHtml(PICKUP_HOURS_NOTE)}</p>
        </td>
      </tr>
    </table>

    ${renderCtaButton('Voir ma commande', `${SITE_URL}/compte/commandes`)}
  `

  const text = [
    `Votre commande est prête, ${firstName} !`,
    '',
    `Votre commande ${order.orderNumber} est prête et vous attend chez KAWA Nantes.`,
    '',
    ...order.items.map((item) => `- ${item.productName} × ${item.quantity}`),
    '',
    `Retrait : ${KAWA_OFFICE.address}`,
    PICKUP_HOURS_NOTE,
    '',
    `Voir ma commande : ${SITE_URL}/compte/commandes`,
  ].join('\n')

  return {
    subject: `Votre commande est prête à être récupérée — ${order.orderNumber}`,
    html: renderEmailShell(bodyHtml),
    text,
  }
}

export async function sendOrderReadyForPickupEmail(
  order: DemoOrder,
  overrides?: { to?: string; subjectPrefix?: string }
) {
  const { subject, html, text } = renderOrderReadyForPickupEmail(order)
  await sendOrderEmail({
    to: overrides?.to ?? order.employeeEmail,
    subject: overrides?.subjectPrefix ? `${overrides.subjectPrefix}${subject}` : subject,
    html,
    text,
  })
}
