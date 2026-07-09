import { Resend } from 'resend'
import type { DemoOrder } from '@/app/admin/demo-data'
import { computeOrderTotals, getDeliveryLabel } from '@/app/admin/demo-data'

// Same site the rest of the app treats as canonical (see kawa-salaries-deploy-fix
// memory) — emails need an absolute, publicly reachable URL, unlike in-app links.
const SITE_URL = 'https://kawa-salaries.vercel.app'

const KAWA_SKY = '#41b6e6'
const KAWA_INK = '#282623'
const KAWA_MUTED = '#6b6862'
const KAWA_LINE = '#e4e1db'
const KAWA_BG = '#f7f5f1'

// So a client hitting "reply" on their confirmation lands directly in a KAWA
// staff inbox instead of nowhere (onboarding@resend.dev is a sandbox sender,
// not a real monitored mailbox).
const REPLY_TO_EMAIL = 'thomas.flichy@kawa.coffee'

const PICKUP_HOURS_NOTE = 'Vous pouvez venir récupérer votre commande du lundi au vendredi de 09h à 18h.'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Inline styles + table layout throughout: email clients (Gmail, Outlook...)
// strip <style> blocks and ignore flex/grid, so this deliberately doesn't
// reuse the invoice PDF's stylesheet even though it echoes the same palette.
export function renderOrderConfirmationEmail(order: DemoOrder) {
  const totals = computeOrderTotals(order.items)
  const firstName = order.employeeName.split(' ')[0] ?? order.employeeName
  const deliveryLabel = getDeliveryLabel(order)

  const itemsRows = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${KAWA_LINE};color:${KAWA_INK};font-size:14px;">
            ${escapeHtml(item.productName)}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid ${KAWA_LINE};color:${KAWA_MUTED};font-size:14px;text-align:center;">
            × ${item.quantity}
          </td>
          <td style="padding:10px 0;border-bottom:1px solid ${KAWA_LINE};color:${KAWA_INK};font-size:14px;text-align:right;font-weight:600;">
            ${currency.format(item.unitPriceTTC * item.quantity)}
          </td>
        </tr>`
    )
    .join('')

  const html = `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background-color:${KAWA_BG};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${KAWA_BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${KAWA_LINE};">
            <tr>
              <td style="padding:20px 32px;border-bottom:1px solid ${KAWA_LINE};">
                <img src="${SITE_URL}/logo-kawa-nantes-wordmark.png" alt="KAWA Nantes" width="260" height="76" style="display:block;margin:0 auto;" />
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px;">
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
                  ${itemsRows}
                  <tr>
                    <td style="padding:14px 0 0;color:${KAWA_INK};font-size:15px;font-weight:700;" colSpan="2">
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

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                  <tr>
                    <td style="border-radius:8px;background-color:${KAWA_SKY};">
                      <a href="${SITE_URL}/compte/commandes" style="display:inline-block;padding:12px 24px;color:#0c2733;font-size:14px;font-weight:600;text-decoration:none;">
                        Voir ma commande
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:${KAWA_BG};border-top:1px solid ${KAWA_LINE};">
                <p style="margin:0;color:${KAWA_MUTED};font-size:12px;line-height:1.6;">
                  Kawa Coffee Nantes — 75 Bd Ernest Dalby, 44000 Nantes<br/>
                  <a href="mailto:nantes@kawa.coffee" style="color:${KAWA_MUTED};">nantes@kawa.coffee</a> · 09 77 71 53 02
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

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
    html,
    text,
  }
}

// The actual send is split out from the render so the same HTML/text can be
// previewed or redirected to a test address without duplicating the template.
export async function sendOrderConfirmationEmail(order: DemoOrder, overrides?: { to?: string; subjectPrefix?: string }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[order-confirmation] RESEND_API_KEY not set, skipping email send')
    return
  }
  const { subject, html, text } = renderOrderConfirmationEmail(order)
  const resend = new Resend(process.env.RESEND_API_KEY)
  await resend.emails.send({
    from: 'kawa-salaries <onboarding@resend.dev>',
    to: overrides?.to ?? order.employeeEmail,
    replyTo: REPLY_TO_EMAIL,
    subject: overrides?.subjectPrefix ? `${overrides.subjectPrefix}${subject}` : subject,
    html,
    text,
  })
}
