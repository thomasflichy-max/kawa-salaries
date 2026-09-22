import {
  SITE_URL,
  KAWA_SKY,
  KAWA_INK,
  KAWA_MUTED,
  escapeHtml,
  renderEmailShell,
  renderCtaButton,
  sendOrderEmail,
} from './shared'

// Sent by the daily reminder cron (app/api/cron/subscription-reminders) —
// the item has already been added to the salarié's cart by the time this
// goes out, they just need to open it, pick a delivery option and pay via
// CAWL like any other order. Not a real recurring charge — see the
// migration's comment.
export function renderSubscriptionReminderEmail({
  firstName,
  productName,
  quantity,
}: {
  firstName: string
  productName: string
  quantity: number
}) {
  const bodyHtml = `
    <p style="margin:0 0 4px;color:${KAWA_SKY};font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;">
      Réassort automatique
    </p>
    <h1 style="margin:0 0 16px;color:${KAWA_INK};font-size:22px;">
      Il est temps de recommander, ${escapeHtml(firstName)} !
    </h1>
    <p style="margin:0 0 24px;color:${KAWA_MUTED};font-size:14px;line-height:1.6;">
      Comme prévu, nous avons ajouté <strong style="color:${KAWA_INK};">${escapeHtml(productName)}</strong>
      (× ${quantity}) à votre panier KAWA. Il ne vous reste plus qu&apos;à choisir votre livraison
      et régler la commande.
    </p>
    ${renderCtaButton('Voir mon panier', `${SITE_URL}/compte/panier`)}
    <p style="margin:24px 0 0;color:${KAWA_MUTED};font-size:12px;line-height:1.5;">
      Vous pouvez modifier la fréquence ou mettre cet abonnement en pause à tout moment depuis
      <a href="${SITE_URL}/compte/abonnements" style="color:${KAWA_MUTED};">Mes abonnements</a>.
    </p>
  `

  const text = [
    `Il est temps de recommander, ${firstName} !`,
    '',
    `Nous avons ajouté ${productName} (× ${quantity}) à votre panier KAWA.`,
    '',
    `Voir mon panier : ${SITE_URL}/compte/panier`,
    `Gérer mes abonnements : ${SITE_URL}/compte/abonnements`,
  ].join('\n')

  return {
    subject: `On a préparé votre réassort — ${productName}`,
    html: renderEmailShell(bodyHtml),
    text,
  }
}

export async function sendSubscriptionReminderEmail(
  to: string,
  input: { firstName: string; productName: string; quantity: number }
) {
  const { subject, html, text } = renderSubscriptionReminderEmail(input)
  await sendOrderEmail({ to, subject, html, text })
}
