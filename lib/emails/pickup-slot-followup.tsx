import { KAWA_OFFICE } from '@/app/admin/demo-data'
import {
  KAWA_SKY,
  KAWA_INK,
  KAWA_MUTED,
  PICKUP_HOURS_NOTE,
  escapeHtml,
  renderEmailShell,
  renderCtaButton,
  sendOrderEmail,
} from './shared'

// Sent by the daily cron (app/api/cron/pickup-slot-followups) exactly once,
// 3 days after the "commande prête" email, to anyone who still hasn't
// picked a pickup slot — order is already sitting at the agence either way,
// this is just a nudge to plan the trip.
export function renderPickupSlotFollowupEmail({
  firstName,
  orderNumber,
  scheduleUrl,
}: {
  firstName: string
  orderNumber: string
  scheduleUrl: string
}) {
  const bodyHtml = `
    <p style="margin:0 0 4px;color:${KAWA_SKY};font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
      Toujours à récupérer
    </p>
    <h1 style="margin:0 0 16px;color:${KAWA_INK};font-size:22px;">
      Votre café vous attend, ${escapeHtml(firstName)} !
    </h1>
    <p style="margin:0 0 24px;color:${KAWA_MUTED};font-size:14px;line-height:1.6;">
      Votre commande <strong style="color:${KAWA_INK};">${escapeHtml(orderNumber)}</strong> est
      prête depuis quelques jours chez KAWA Nantes, mais vous n&apos;avez pas encore indiqué
      quand vous comptiez passer la récupérer.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f7f5f1;border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 2px;color:${KAWA_MUTED};font-size:12px;text-transform:uppercase;letter-spacing:0.03em;">
            Retrait
          </p>
          <p style="margin:0;color:${KAWA_INK};font-size:14px;">${escapeHtml(KAWA_OFFICE.address)}</p>
          <p style="margin:8px 0 0;color:${KAWA_MUTED};font-size:13px;line-height:1.5;">${escapeHtml(PICKUP_HOURS_NOTE)}</p>
        </td>
      </tr>
    </table>
    ${renderCtaButton('Choisir mon créneau de passage', scheduleUrl)}
  `

  const text = [
    `Votre café vous attend, ${firstName} !`,
    '',
    `Votre commande ${orderNumber} est prête depuis quelques jours chez KAWA Nantes, mais vous n'avez pas encore indiqué quand vous comptiez passer la récupérer.`,
    '',
    `Retrait : ${KAWA_OFFICE.address}`,
    PICKUP_HOURS_NOTE,
    '',
    `Choisir mon créneau de passage : ${scheduleUrl}`,
  ].join('\n')

  return {
    subject: `Votre café vous attend — ${orderNumber}`,
    html: renderEmailShell(bodyHtml),
    text,
  }
}

export async function sendPickupSlotFollowupEmail(
  to: string,
  input: { firstName: string; orderNumber: string; scheduleUrl: string }
) {
  const { subject, html, text } = renderPickupSlotFollowupEmail(input)
  await sendOrderEmail({ to, subject, html, text })
}
