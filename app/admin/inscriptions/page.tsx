import { createClient } from '@/lib/supabase/server'

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })

const REASON_LABELS: Record<string, string> = {
  domain_not_recognized: "Domaine d'entreprise non reconnu",
}

export default async function AdminInscriptionsPage() {
  const supabase = await createClient()
  const { data: attempts, error } = await supabase
    .from('signup_attempts')
    .select('id, email, full_name, domain, success, reason, created_at, organizations(name)')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    console.error('[admin/inscriptions] failed to load signup attempts:', error)
  }

  const rows = attempts ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-kawa-800">Inscriptions salariés</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Historique des créations de compte, réussies et échouées (domaine d&apos;entreprise
          non reconnu). Les 200 dernières tentatives.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Nom</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Entreprise / domaine</th>
                <th className="px-5 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((attempt) => (
                <tr key={attempt.id} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3 text-kawa-500 whitespace-nowrap">
                    {dateFormat.format(new Date(attempt.created_at))}
                  </td>
                  <td className="px-5 py-3 text-kawa-800">{attempt.full_name ?? '—'}</td>
                  <td className="px-5 py-3 text-kawa-500">{attempt.email}</td>
                  <td className="px-5 py-3 text-kawa-500">
                    {(attempt.organizations as { name: string } | null)?.name ?? attempt.domain}
                  </td>
                  <td className="px-5 py-3">
                    {attempt.success ? (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        Compte créé
                      </span>
                    ) : (
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700"
                        title={attempt.reason ? REASON_LABELS[attempt.reason] ?? attempt.reason : undefined}
                      >
                        Échec — {attempt.reason ? REASON_LABELS[attempt.reason] ?? attempt.reason : 'inconnu'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={5}>
                    Aucune tentative d&apos;inscription pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
