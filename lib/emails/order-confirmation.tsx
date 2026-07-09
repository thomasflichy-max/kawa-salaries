import { renderToBuffer } from '@react-pdf/renderer'
import type { DemoOrder } from '@/app/admin/demo-data'
import { computeOrderTotals, getDeliveryLabel } from '@/app/admin/demo-data'
import { InvoiceDocument } from '@/app/admin/commandes/pdf/invoice-document'
import {
  SITE_URL,
  KAWA_SKY,
  KAWA_INK,
  KAWA_MUTED,
  KAWA_BG,
  PICKUP_HOURS_NOTE,
  currency,
  dateFormat,
  escapeHtml,
  renderItemsTableRows,
  renderEmailShell,
  renderCtaButton,
  sendOrderEmail,
} from './shared'

export function renderOrderConfirmationEmail(order: DemoOrder) {
  const totals = computeOrderTotals(order.items)
  const firstName = order.employeeName.split(' ')[0] ?? order.employeeName
  const deliveryLabel = getDeliveryLabel(order)

  const bodyHtml = `
    <p style="margin:0 0 4px;color:${KAWA_SKY};font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
      Commande confirmée
    </p>
    <h1 style="margin:0 0 16px;color:${KAWA_INK};font-size:22px;">
      Merci, ${escapeHtml(firstName)} !
    </h1>
    <p style="margin:0 0 24px;color:${KAWA_MUTED};font-size:14px;line-height:1.6;">
      Nous avons bien reçu votre commande <strong style="color:${KAWA_INK};">${escapeHtml(order.orderNumber)}</strong>
      du ${dateFormat.format(new Date(order.createdAt))}. Elle est en cours de préparation.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${renderItemsTableRows(order.items)}
      <tr>
        <td colspan="3" style="padding:14px 0 0;color:${KAWA_INK};font-size:15px;font-weight:700;">
          Total TTC
        </td>
        <td style="padding:14px 0 0;color:${KAWA_SKY};font-size:15px;font-weight:700;text-align:right;">
          ${currency.format(totals.totalTTC)}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:${KAWA_BG};border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 2px;color:${KAWA_MUTED};font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">
            Adresse de facturation
          </p>
          <p style="margin:0;color:${KAWA_INK};font-size:14px;white-space:pre-line;">${escapeHtml(order.billingAddress)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px ${order.deliveryMode === 'pickup' ? '4px' : '16px'};">
          <p style="margin:0 0 2px;color:${KAWA_MUTED};font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">
            ${order.deliveryMode === 'pickup' ? 'Retrait' : 'Livraison'}
          </p>
          <p style="margin:0;color:${KAWA_INK};font-size:14px;">${escapeHtml(deliveryLabel)}</p>
        </td>
      </tr>
      ${
        order.deliveryMode === 'pickup'
          ? `<tr>
        <td style="padding:0 20px 16px;">
          <p style="margin:0;color:${KAWA_MUTED};font-size:13px;line-height:1.5;">${escapeHtml(PICKUP_HOURS_NOTE)}</p>
        </td>
      </tr>`
          : ''
      }
    </table>

    ${renderCtaButton('Voir ma commande', `${SITE_URL}/compte/commandes`)}
  `

  const text = [
    `Merci, ${firstName} !`,
    '',
    `Nous avons bien reçu votre commande ${order.orderNumber} du ${dateFormat.format(new Date(order.createdAt))}.`,
    '',
    ...order.items.map(
      (item) => `- ${item.productName} × ${item.quantity} — ${currency.format(item.unitPriceTTC * item.quantity)}`
    ),
    '',
    `Total TTC : ${currency.format(totals.totalTTC)}`,
    '',
    `Adresse de facturation : ${order.billingAddress}`,
    `${order.deliveryMode === 'pickup' ? 'Retrait' : 'Livraison'} : ${deliveryLabel}`,
    ...(order.deliveryMode === 'pickup' ? [PICKUP_HOURS_NOTE] : []),
    '',
    `Voir ma commande : ${SITE_URL}/compte/commandes`,
  ].join('\n')

  return {
    subject: `Confirmation de commande — ${order.orderNumber}`,
    html: renderEmailShell(bodyHtml),
    text,
  }
}

// The actual send is split out from the render so the same HTML/text can be
// previewed or redirected to a test address without duplicating the template.
export async function sendOrderConfirmationEmail(
  order: DemoOrder,
  overrides?: { to?: string; subjectPrefix?: string }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[order-confirmation] RESEND_API_KEY not set, skipping email send')
    return
  }
  const { subject, html, text } = renderOrderConfirmationEmail(order)
  const invoiceBuffer = await renderToBuffer(<InvoiceDocument order={order} />)
  await sendOrderEmail({
    to: overrides?.to ?? order.employeeEmail,
    subject: overrides?.subjectPrefix ? `${overrides.subjectPrefix}${subject}` : subject,
    html,
    text,
    attachments: [{ filename: `facture-${order.orderNumber}.pdf`, content: invoiceBuffer }],
  })
}
