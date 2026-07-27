import { createClient } from '@/lib/supabase/server'

const timeFormat = new Intl.DateTimeFormat('fr-FR', { timeStyle: 'short' })
const dayLabelFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

const REASON_LABELS: Record<string, string> = {
  domain_not_recognized: "Domaine d'entreprise non reconnu",
}

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

type Attempt = {
  id: string
  email: string
  full_name: string | null
  domain: string
  success: boolean
  reason: string | null
  created_at: string
  organizations: { name: string } | null
}

function AttemptMessage({ attempt }: { attempt: Attempt }) {
  const date = new Date(attempt.created_at)
  const companyName = attempt.organizations?.name ?? attempt.domain

  return (
    <div className="flex gap-3 py-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg ${
          attempt.success ? 'bg-emerald-100' : 'bg-red-100'
        }`}
      >
        {attempt.success ? '🎉' : '⚠️'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-kawa-800 text-sm">
            {attempt.success ? 'Nouvelle inscription' : "Tentative d'inscription échouée"}
          </span>
          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide bg-kawa-100 text-kawa-500">
            BOT
          </span>
          <span className="text-xs text-kawa-400">{timeFormat.format(date)}</span>
        </div>

        <div
          className={`mt-2 rounded-xl border p-4 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm ${
            attempt.success ? 'bg-kawa-50 border-kawa-200' : 'bg-red-50 border-red-100'
          }`}
        >
          <div>
            <p className="text-kawa-500 text-xs uppercase tracking-wide">Nom</p>
            <p className="text-kawa-800 font-medium mt-0.5">{attempt.full_name ?? '—'}</p>
          </div>
          <div>
            <p className="text-kawa-500 text-xs uppercase tracking-wide">Entreprise</p>
            <p className="text-kawa-800 font-medium mt-0.5">{companyName}</p>
          </div>
          <div>
            <p className="text-kawa-500 text-xs uppercase tracking-wide">Email</p>
            <p className="text-sky-700 mt-0.5">{attempt.email}</p>
          </div>
          <div>
            <p className="text-kawa-500 text-xs uppercase tracking-wide">Statut</p>
            <p className={`mt-0.5 font-medium ${attempt.success ? 'text-emerald-700' : 'text-red-700'}`}>
              {attempt.success
                ? 'Compte créé'
                : `Échec — ${attempt.reason ? REASON_LABELS[attempt.reason] ?? attempt.reason : 'inconnu'}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default async function AdminInscriptionsPage() {
  const supabase = await createClient()
  const { data: attempts, error } = await supabase
    .from('signup_attempts')
    .select('id, email, full_name, domain, success, reason, created_at, organizations(name)')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[admin/inscriptions] failed to load signup attempts:', error)
  }

  const rows = (attempts ?? []) as unknown as Attempt[]

  // Group consecutive-by-date rows under a day separator, same as a chat
  // channel — rows already come back newest-first from the query.
  const groups: { key: string; label: string; attempts: Attempt[] }[] = []
  for (const attempt of rows) {
    const date = new Date(attempt.created_at)
    const key = dayKey(date)
    const lastGroup = groups[groups.length - 1]
    if (lastGroup?.key === key) {
      lastGroup.attempts.push(attempt)
    } else {
      groups.push({ key, label: dayLabel(date), attempts: [attempt] })
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-kawa-800">Canal d&apos;inscriptions</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Chaque création de compte salarié, réussie ou échouée (domaine d&apos;entreprise non
          reconnu) — les 500 derniers événements.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 p-5">
        {groups.length === 0 && (
          <p className="text-kawa-400 text-center py-10">Aucune tentative d&apos;inscription pour le moment.</p>
        )}
        {groups.map((group) => (
          <div key={group.key}>
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-kawa-100" />
              <span className="text-xs font-medium text-kawa-400 whitespace-nowrap">{group.label}</span>
              <div className="h-px flex-1 bg-kawa-100" />
            </div>
            <div className="divide-y divide-kawa-50">
              {group.attempts.map((attempt) => (
                <AttemptMessage key={attempt.id} attempt={attempt} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
