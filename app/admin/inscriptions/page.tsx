import { createClient } from '@/lib/supabase/server'
import { ReactionBar } from './reaction-bar'
import { CommentThread } from './comment-thread'
import { MarkSeen } from './mark-seen'
import { parisDayKey as dayKey, parisDayLabel as dayLabel, parisTimeFormat as timeFormat } from '@/lib/dates'

const REASON_LABELS: Record<string, string> = {
  domain_not_recognized: "Domaine d'entreprise non reconnu",
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

type Reaction = { emoji: string; staff_email: string }
type Comment = { id: string; author_email: string; body: string; created_at: string }

function AttemptMessage({
  attempt,
  reactions,
  comments,
  currentUserEmail,
}: {
  attempt: Attempt
  reactions: Reaction[]
  comments: Comment[]
  currentUserEmail: string
}) {
  const date = new Date(attempt.created_at)
  const companyName = attempt.organizations?.name ?? attempt.domain

  return (
    <div className="flex gap-3 py-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-lg ${
          attempt.success ? 'bg-emerald-100' : 'bg-kawa-100'
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

        <div className="mt-2 rounded-xl border bg-kawa-50 border-kawa-200 p-4 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
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

        <ReactionBar attemptId={attempt.id} reactions={reactions} currentUserEmail={currentUserEmail} />
        <CommentThread attemptId={attempt.id} comments={comments} />
      </div>
    </div>
  )
}

export default async function AdminInscriptionsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: attempts, error } = await supabase
    .from('signup_attempts')
    .select('id, email, full_name, domain, success, reason, created_at, organizations(name)')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('[admin/inscriptions] failed to load signup attempts:', error)
  }

  const rows = (attempts ?? []) as unknown as Attempt[]
  const attemptIds = rows.map((a) => a.id)

  const [{ data: reactionRows }, { data: commentRows }] =
    attemptIds.length > 0
      ? await Promise.all([
          supabase
            .from('signup_attempt_reactions')
            .select('attempt_id, emoji, staff_email')
            .in('attempt_id', attemptIds),
          supabase
            .from('signup_attempt_comments')
            .select('id, attempt_id, author_email, body, created_at')
            .in('attempt_id', attemptIds)
            .order('created_at', { ascending: true }),
        ])
      : [{ data: [] }, { data: [] }]

  const reactionsByAttempt = new Map<string, Reaction[]>()
  for (const row of reactionRows ?? []) {
    const list = reactionsByAttempt.get(row.attempt_id) ?? []
    list.push({ emoji: row.emoji, staff_email: row.staff_email })
    reactionsByAttempt.set(row.attempt_id, list)
  }

  const commentsByAttempt = new Map<string, Comment[]>()
  for (const row of commentRows ?? []) {
    const list = commentsByAttempt.get(row.attempt_id) ?? []
    list.push({ id: row.id, author_email: row.author_email, body: row.body, created_at: row.created_at })
    commentsByAttempt.set(row.attempt_id, list)
  }

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
      <MarkSeen />
      <div>
        <h1 className="text-xl font-bold text-kawa-800">Canal d&apos;inscriptions</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Chaque création de compte salarié, réussie ou échouée (domaine d&apos;entreprise non
          reconnu) — les 500 derniers événements. Réagis ou commente comme sur un fil de
          discussion.
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
                <AttemptMessage
                  key={attempt.id}
                  attempt={attempt}
                  reactions={reactionsByAttempt.get(attempt.id) ?? []}
                  comments={commentsByAttempt.get(attempt.id) ?? []}
                  currentUserEmail={user?.email ?? ''}
                />
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
