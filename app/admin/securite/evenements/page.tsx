import { createClient } from '@/lib/supabase/server'
import { MarkSeen } from './mark-seen'
import { PushNotificationButton } from './push-notification-button'
import { ReplyBox } from './reply-box'
import { parisDayKey as dayKey, parisDayLabel as dayLabel, parisTimeFormat as timeFormat } from '@/lib/dates'

const EVENT_LABELS: Record<string, { title: string; icon: string }> = {
  login_failed: { title: 'Connexion échouée', icon: '⚠️' },
  admin_signup_rejected: { title: 'Tentative de création de compte admin refusée', icon: '🚨' },
  unauthorized_admin_access: { title: 'Accès admin non autorisé', icon: '🔒' },
  cawl_webhook_signature_invalid: { title: 'Signature de webhook CAWL invalide', icon: '🛑' },
  document_archiving_failed: { title: 'Archivage de document échoué', icon: '🗂️' },
  unauthorized_profile_change: {
    title: 'Modification de profil non autorisée bloquée',
    icon: '🧨',
  },
  support_message: { title: "Question d'un salarié", icon: '💬' },
  support_reply: { title: 'Réponse envoyée', icon: '↩️' },
}

// Support messages and replies aren't a threat — calmer colors keep them
// visually distinct from actual security alerts in the same feed, and from
// each other (incoming question vs. outgoing reply).
const SUPPORT_EVENT_TYPES = new Set(['support_message', 'support_reply'])
const EVENT_ICON_BG: Record<string, string> = {
  support_message: 'bg-sky-50',
  support_reply: 'bg-emerald-50',
}

type SecurityEvent = {
  id: string
  event_type: string
  email: string | null
  detail: string | null
  created_at: string
}

function EventMessage({ event }: { event: SecurityEvent }) {
  const date = new Date(event.created_at)
  const meta = EVENT_LABELS[event.event_type] ?? { title: event.event_type, icon: '❔' }
  const isSupport = SUPPORT_EVENT_TYPES.has(event.event_type)
  const isQuestion = event.event_type === 'support_message'
  const isReply = event.event_type === 'support_reply'

  return (
    <div className="flex gap-3 py-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg ${
          EVENT_ICON_BG[event.event_type] ?? (isSupport ? 'bg-sky-50' : 'bg-red-50')
        }`}
      >
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-kawa-800 text-sm">{meta.title}</span>
          <span className="text-xs text-kawa-400">{timeFormat.format(date)}</span>
        </div>

        <div className="mt-2 rounded-xl border bg-kawa-50 border-kawa-200 p-4 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-kawa-500 text-xs uppercase tracking-wide">
              {isReply ? 'Destinataire' : 'Email'}
            </p>
            <p className="text-sky-700 mt-0.5">{event.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-kawa-500 text-xs uppercase tracking-wide">
              {isQuestion ? 'Message' : isReply ? 'Réponse' : 'Détail'}
            </p>
            <p className="text-kawa-800 mt-0.5 break-all">{event.detail ?? '—'}</p>
          </div>
        </div>

        {isQuestion && event.email && <ReplyBox email={event.email} />}
      </div>
    </div>
  )
}

export default async function AdminSecurityEventsPage() {
  const supabase = await createClient()

  const { data: events, error } = await supabase
    .from('security_events')
    .select('id, event_type, email, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[admin/securite/evenements] failed to load security events:', error)
  }

  const rows = (events ?? []) as SecurityEvent[]

  // Group consecutive-by-date rows under a day separator, same as the
  // "Canal d'inscriptions" chat-style layout — rows already come back
  // newest-first from the query.
  const groups: { key: string; label: string; events: SecurityEvent[] }[] = []
  for (const event of rows) {
    const date = new Date(event.created_at)
    const key = dayKey(date)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup?.key === key) {
      lastGroup.events.push(event)
    } else {
      groups.push({ key, label: dayLabel(date), events: [event] })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <MarkSeen />
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-kawa-800">Account Management</h1>
          <p className="text-kawa-500 text-sm mt-1">
            Questions envoyées par les salariés, connexions échouées, tentatives d&apos;accès admin
            non autorisées, tentatives de création de compte admin refusées, et signatures de
            webhook CAWL invalides — les 500 derniers événements.
          </p>
        </div>
        <PushNotificationButton />
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 p-5">
        {groups.length === 0 && (
          <p className="text-kawa-400 text-center py-10">Aucun message ni événement pour le moment.</p>
        )}
        {groups.map((group) => (
          <div key={group.key}>
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-kawa-100" />
              <span className="text-xs font-medium text-kawa-400 whitespace-nowrap">{group.label}</span>
              <div className="h-px flex-1 bg-kawa-100" />
            </div>
            <div className="divide-y divide-kawa-50">
              {group.events.map((event) => (
                <EventMessage key={event.id} event={event} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
