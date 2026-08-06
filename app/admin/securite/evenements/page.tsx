import { createClient } from '@/lib/supabase/server'
import { MarkSeen } from './mark-seen'

const timeFormat = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' })
const dayLabelFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const EVENT_LABELS: Record<string, { title: string; icon: string }> = {
  login_failed: { title: 'Connexion échouée', icon: '⚠️' },
  admin_signup_rejected: { title: 'Tentative de création de compte admin refusée', icon: '🚨' },
  unauthorized_admin_access: { title: 'Accès admin non autorisé', icon: '🔒' },
  cawl_webhook_signature_invalid: { title: 'Signature de webhook CAWL invalide', icon: '🛑' },
  unauthorized_profile_change: {
    title: 'Modification de profil non autorisée bloquée',
    icon: '🧨',
  },
  support_message: { title: "Question d'un salarié", icon: '💬' },
}

// Support messages aren't a threat — a separate, calmer color keeps them
// visually distinct from actual security alerts in the same feed.
const SUPPORT_EVENT_TYPES = new Set(['support_message'])

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function dayLabel(date: Date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (dayKey(date) === dayKey(today)) return "Aujourd'hui"
  if (dayKey(date) === dayKey(yesterday)) return 'Hier'

  const label = dayLabelFormat.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
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

  return (
    <div className="flex gap-3 py-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg ${
          isSupport ? 'bg-sky-50' : 'bg-red-50'
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
            <p className="text-kawa-500 text-xs uppercase tracking-wide">Email</p>
            <p className="text-sky-700 mt-0.5">{event.email ?? '—'}</p>
          </div>
          <div>
            <p className="text-kawa-500 text-xs uppercase tracking-wide">
              {isSupport ? 'Message' : 'Détail'}
            </p>
            <p className="text-kawa-800 mt-0.5 break-all">{event.detail ?? '—'}</p>
          </div>
        </div>

        {isSupport && event.email && (
          <a
            href={`mailto:${event.email}?subject=${encodeURIComponent('Re: votre question KAWA')}`}
            className="inline-block mt-2 text-xs text-sky-700 hover:underline"
          >
            Répondre par email
          </a>
        )}
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
      <div>
        <h1 className="text-xl font-bold text-kawa-800">Sécurité &amp; support</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Questions envoyées par les salariés, connexions échouées, tentatives d&apos;accès admin
          non autorisées, tentatives de création de compte admin refusées, et signatures de
          webhook CAWL invalides — les 500 derniers événements.
        </p>
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
