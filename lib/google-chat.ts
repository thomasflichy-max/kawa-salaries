// Posts to the private KAWA staff Google Chat space (only brieuc@ and jean@
// are members — see GOOGLE_CHAT_WEBHOOK_URL). Same "fire-and-forget, never
// break the caller" reasoning as notifyStaffDevices: this is a second,
// more reliable channel alongside the OS push notifications, not a
// replacement — a failure here must never fail the action that triggered it.
//
// `url` (also used to deep-link the push notification) is deliberately
// ignored here — a link on every message was reported as clutter.
export async function notifyGoogleChat(payload: { title: string; body: string; url?: string }) {
  const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL
  if (!webhookUrl) return

  const text = `*${payload.title}*\n${payload.body}`

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    console.error('[notifyGoogleChat] request failed:', response.status, await response.text())
  }
}
