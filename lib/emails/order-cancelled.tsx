import { renderToBuffer } from '@react-pdf/renderer'
import type { DemoOrder } from '@/app/admin/demo-data'
import { computeOrderTotals } from '@/app/admin/demo-data'
import { AvoirDocument } from '@/app/admin/commandes/pdf/avoir-document'
import {
  SITE_URL,
  KAWA_SKY,
  KAWA_INK,
  KAWA_MUTED,
  KAWA_BG,
  currency,
  escapeHtml,
  renderItemsTableRows,
  renderEmailShell,
  renderCtaButton,
  sendOrderEmail,
} from './shared'

// KAWA doesn't refund cancelled orders — an avoir (credit note) is issued
// instead, usable on a future order. Sent once, the moment staff cancel an
// order from the admin (see notifyIfJustCancelled in commandes/actions.ts).
export function renderOrderCancelledEmail(order: DemoOrder) {
  const totals = computeOrderTotals(order.items)
  const firstName = order.employeeName.split(' ')[0] ?? order.employeeName

  const bodyHtml = `
    <p style="margin:0 0 4px;color:${KAWA_SKY};font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
      Commande annulée
    </p>
    <h1 style="margin:0 0 16px;color:${KAWA_INK};font-size:22px;">
      Votre commande a été annulée, ${escapeHtml(firstName)}
    </h1>
    <p style="margin:0 0 16px;color:${KAWA_MUTED};font-size:14px;line-height:1.6;">
      Votre commande <strong style="color:${KAWA_INK};">${escapeHtml(order.orderNumber)}</strong> a été annulée.
    </p>
    <p style="margin:0 0 24px;color:${KAWA_MUTED};font-size:14px;line-height:1.6;">
      Conformément à nos conditions générales de vente, les commandes annulées ne font pas
      l&apos;objet d&apos;un remboursement. Un avoir de
      <strong style="color:${KAWA_INK};">${currency.format(totals.totalTTC)}</strong>
      vous est délivré à la place — vous le trouverez en pièce jointe, et pourrez l&apos;utiliser
      sans limite de durée sur une prochaine commande.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      ${renderItemsTableRows(order.items)}
      <tr>
        <td colspan="3" style="padding:14px 0 0;color:${KAWA_INK};font-size:15px;font-weight:700;">
          Montant de l&apos;avoir
        </td>
        <td style="padding:14px 0 0;color:${KAWA_SKY};font-size:15px;font-weight:700;text-align:right;">
          ${currency.format(totals.totalTTC)}
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:${KAWA_BG};border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0;color:${KAWA_MUTED};font-size:13px;line-height:1.6;">
            Une question sur cette annulation ? Répondez directement à ce mail, ou écrivez-nous à
            <a href="mailto:nantes@kawa.coffee" style="color:${KAWA_SKY};">nantes@kawa.coffee</a>.
          </p>
        </td>
      </tr>
    </table>

    ${renderCtaButton('Découvrir nos produits', `${SITE_URL}/compte/produits`)}
  `

  const text = [
    `Votre commande a été annulée, ${firstName}.`,
    '',
    `Votre commande ${order.orderNumber} a été annulée.`,
    '',
    "Conformément à nos conditions générales de vente, les commandes annulées ne font pas l'objet d'un remboursement.",
    `Un avoir de ${currency.format(totals.totalTTC)} vous est délivré à la place (voir pièce jointe), utilisable sans limite de durée sur une prochaine commande.`,
    '',
    ...order.items.map((item) => `- ${item.productName} × ${item.quantity} — ${currency.format(item.unitPriceTTC * item.quantity)}`),
    '',
    `Découvrir nos produits : ${SITE_URL}/compte/produits`,
  ].join('\n')

  return {
    subject: `Commande annulée — avoir émis — ${order.orderNumber}`,
    html: renderEmailShell(bodyHtml),
    text,
  }
}

export async function sendOrderCancelledEmail(
  order: DemoOrder,
  overrides?: { to?: string; subjectPrefix?: string }
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[order-cancelled] RESEND_API_KEY not set, skipping email send')
    return
  }
  const { subject, html, text } = renderOrderCancelledEmail(order)
  const avoirBuffer = await renderToBuffer(<AvoirDocument order={order} />)
  await sendOrderEmail({
    to: overrides?.to ?? order.employeeEmail,
    subject: overrides?.subjectPrefix ? `${overrides.subjectPrefix}${subject}` : subject,
    html,
    text,
    attachments: [{ filename: `avoir-${order.orderNumber}.pdf`, content: avoirBuffer }],
  })
}
