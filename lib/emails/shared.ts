import { Resend } from 'resend'
import type { DemoOrderItem } from '@/app/admin/demo-data'

// Same site the rest of the app treats as canonical (see kawa-salaries-deploy-fix
// memory) — emails need an absolute, publicly reachable URL, unlike in-app links.
export const SITE_URL = 'https://kawa-salaries.vercel.app'

export const KAWA_SKY = '#41b6e6'
export const KAWA_INK = '#282623'
export const KAWA_MUTED = '#6b6862'
export const KAWA_LINE = '#e4e1db'
export const KAWA_BG = '#f7f5f1'

// So a client hitting "reply" on an order email lands directly in a KAWA
// staff inbox instead of nowhere (onboarding@resend.dev is a sandbox sender,
// not a real monitored mailbox).
export const REPLY_TO_EMAIL = 'thomas.flichy@kawa.coffee'

export const PICKUP_HOURS_NOTE =
  'Vous pouvez venir récupérer votre commande du lundi au vendredi de 09h à 18h.'

export const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
export const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function absoluteImageUrl(imageUrl: string) {
  return imageUrl.startsWith('http') ? imageUrl : `${SITE_URL}${imageUrl}`
}

// Shared by every order email that shows a line-item table (confirmation,
// ready-for-pickup...) so the markup stays identical between them.
export function renderItemsTableRows(items: DemoOrderItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid ${KAWA_LINE};width:48px;">
            <img src="${absoluteImageUrl(item.imageUrl)}" alt="${escapeHtml(item.productName)}" width="40" height="40" style="display:block;border-radius:8px;object-fit:cover;" />
          </td>
          <td style="padding:10px 0 10px 12px;border-bottom:1px solid ${KAWA_LINE};color:${KAWA_INK};font-size:14px;">
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
}

// Inline styles + table layout throughout: email clients (Gmail, Outlook...)
// strip <style> blocks and ignore flex/grid. Wraps any body content (already
// laid out the same way) with the logo header and KAWA legal footer shared by
// every order email.
export function renderEmailShell(bodyHtml: string) {
  return `<!doctype html>
<html lang="fr">
  <body style="margin:0;padding:0;background-color:${KAWA_BG};font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${KAWA_BG};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid ${KAWA_LINE};">
            <tr>
              <td style="padding:20px 32px;border-bottom:1px solid ${KAWA_LINE};text-align:center;">
                <a href="https://kawanantespro.com/" target="_blank" rel="noopener noreferrer">
                  <img src="${SITE_URL}/logo-kawa-nantes-wordmark.png" alt="KAWA Nantes" width="260" height="76" style="display:inline-block;border:0;" />
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 32px;">
                ${bodyHtml}
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
}

export function renderCtaButton(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                  <tr>
                    <td style="border-radius:8px;background-color:${KAWA_SKY};">
                      <a href="${href}" style="display:inline-block;padding:12px 24px;color:#0c2733;font-size:14px;font-weight:600;text-decoration:none;">
                        ${escapeHtml(label)}
                      </a>
                    </td>
                  </tr>
                </table>`
}

type SendOrderEmailInput = {
  to: string
  subject: string
  html: string
  text: string
  attachments?: { filename: string; content: Buffer }[]
}

// Thin, shared wrapper around Resend so every order email is skipped the
// same way (with a warning, not a crash) when no API key is configured.
export async function sendOrderEmail({ to, subject, html, text, attachments }: SendOrderEmailInput) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[emails] RESEND_API_KEY not set, skipping email send')
    return
  }
  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    // kawanantespro.com is a verified sending domain on the Resend account —
    // required to mail real recipients. onboarding@resend.dev is a sandbox
    // sender Resend silently restricts to the account owner's own address,
    // so using it here meant every order email to an actual employee address
    // was rejected — the Resend SDK returns that as `{ error }`, it doesn't
    // throw, so it went unnoticed until an admin reported never getting mail.
    from: 'KAWA Nantes <commandes@kawanantespro.com>',
    to,
    // KAWA staff sees every order email as it goes out, not just replies to
    // it — skipped when `to` is already that same address (test sends).
    ...(to !== REPLY_TO_EMAIL ? { cc: REPLY_TO_EMAIL } : {}),
    replyTo: REPLY_TO_EMAIL,
    subject,
    html,
    text,
    ...(attachments ? { attachments } : {}),
  })
  if (error) {
    throw new Error(`[emails] Resend rejected the send: ${error.name} — ${error.message}`)
  }
}
