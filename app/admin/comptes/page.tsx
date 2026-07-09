import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const DISCOUNT_ABBR: Record<string, string> = {
  classique: 'C',
  bio: 'B',
  decafeine: 'D',
}

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export default async function AdminAccountsPage() {
  const supabase = await createClient()
  const [{ data: organizations }, { data: profiles }, { data: discounts }] = await Promise.all([
    supabase.from('organizations').select('id, name, domain, active').order('name'),
    supabase.from('profiles').select('id, organization_id'),
    supabase.from('organization_coffee_discounts').select('organization_id, subcategory, discount_amount'),
  ])

  const orgs = organizations ?? []
  const employeeCountByOrg = new Map<string, number>()
  for (const p of profiles ?? []) {
    if (!p.organization_id) continue
    employeeCountByOrg.set(p.organization_id, (employeeCountByOrg.get(p.organization_id) ?? 0) + 1)
  }

  const discountsByOrg = new Map<string, string>()
  for (const rule of discounts ?? []) {
    const existing = discountsByOrg.get(rule.organization_id) ?? ''
    const abbr = DISCOUNT_ABBR[rule.subcategory] ?? rule.subcategory
    const amount = `${abbr} -${currency.format(rule.discount_amount)}`
    discountsByOrg.set(rule.organization_id, existing ? `${existing} · ${amount}` : amount)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-kawa-800">Comptes clients</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Toutes les entreprises clientes, par ordre alphabétique.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-3 font-medium">Nom</th>
                <th className="px-5 py-3 font-medium">Domaine</th>
                <th className="px-5 py-3 font-medium">Remise café</th>
                <th className="px-5 py-3 font-medium">Salariés</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/comptes/${org.id}`}
                      className="text-kawa-800 font-medium hover:underline"
                    >
                      {org.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-kawa-500">{org.domain}</td>
                  <td className="px-5 py-3 text-kawa-500 whitespace-nowrap">
                    {discountsByOrg.get(org.id) ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-kawa-500">
                    {employeeCountByOrg.get(org.id) ?? 0}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        org.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-kawa-100 text-kawa-600'
                      }`}
                    >
                      {org.active ? 'active' : 'inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/comptes/${org.id}`} className="text-sky-700 hover:underline">
                      Voir le détail
                    </Link>
                  </td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={6}>
                    Aucune entreprise cliente pour le moment.
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
