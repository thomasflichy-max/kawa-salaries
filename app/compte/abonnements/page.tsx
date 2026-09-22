import Image from 'next/image'
import Link from 'next/link'
import { getEmployee } from '@/lib/get-employee'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionRow } from './subscription-row'

const FREQUENCY_LABELS: Record<number, string> = {
  2: 'Toutes les 2 semaines',
  4: 'Tous les mois',
  6: 'Toutes les 6 semaines',
  8: 'Tous les 2 mois',
}

const GRIND_LABELS: Record<string, string> = {
  grain: 'En grains',
  filtre: 'Moulu filtre',
  espresso: 'Moulu espresso',
}

const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

export default async function AbonnementsPage() {
  const { user } = await getEmployee()
  const supabase = await createClient()

  // RLS also scopes this to the caller's own rows for a regular employee,
  // but a @kawa.coffee staff account matches the staff read-all policy too
  // (support/oversight) — filter explicitly so a staff preview of this page
  // doesn't show every salarié's subscriptions (same fix as /compte/commandes).
  const { data: subscriptions, error } = await supabase
    .from('product_subscriptions')
    .select(
      'id, quantity, grind_type, frequency_weeks, active, next_reminder_at, product:products(id, name, image_url, category, price, active, in_stock)'
    )
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[abonnements] failed to load subscriptions:', error)
  }

  const rows = subscriptions ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">Mes abonnements</h1>
        <p className="text-kawa-500 mt-1">
          Un rappel automatique à chaque échéance — vous choisissez la livraison et payez comme
          pour une commande normale. Pas de prélèvement automatique.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-kawa-200 p-10 text-center">
          <p className="text-kawa-500">
            Aucun abonnement pour le moment — vous pouvez en créer un depuis la fiche d&apos;un
            café.
          </p>
          <Link href="/compte/produits/cafes" className="text-sky-700 hover:underline text-sm mt-2 inline-block">
            Voir nos cafés →
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map((sub) => {
            const product = sub.product
            if (!product) return null
            return (
              <li
                key={sub.id}
                className="bg-white rounded-2xl border border-kawa-200 p-5 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="relative w-16 h-16 shrink-0 bg-kawa-50 rounded-lg overflow-hidden">
                  {product.image_url && (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-kawa-800">
                    {product.name}
                    {sub.grind_type && (
                      <span className="text-kawa-500 font-normal">
                        {' '}
                        — {GRIND_LABELS[sub.grind_type] ?? sub.grind_type}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-kawa-500">
                    Qté {sub.quantity} · {FREQUENCY_LABELS[sub.frequency_weeks] ?? `Toutes les ${sub.frequency_weeks} semaines`}
                  </p>
                  {!product.active || !product.in_stock ? (
                    <p className="text-xs text-red-600 mt-0.5">
                      Ce produit n&apos;est plus disponible — l&apos;abonnement ne se réassortira
                      pas tant que ce n&apos;est pas rétabli.
                    </p>
                  ) : (
                    <p className="text-xs text-kawa-400 mt-0.5">
                      {sub.active
                        ? `Prochain rappel le ${dateFormat.format(new Date(sub.next_reminder_at))}`
                        : 'En pause'}
                    </p>
                  )}
                </div>
                <SubscriptionRow id={sub.id} active={sub.active} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
