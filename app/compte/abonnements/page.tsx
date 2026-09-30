import Image from 'next/image'
import Link from 'next/link'
import { getEmployee } from '@/lib/get-employee'
import { createClient } from '@/lib/supabase/server'
import { SubscriptionRow } from './subscription-row'
import { frequencyLabel } from '@/lib/subscription-frequency'
import { grindLabel } from '@/lib/grind-type'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'

export default async function AbonnementsPage() {
  const { user } = await getEmployee()
  const locale = await getLocale()
  const t = getDictionary(locale)
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { dateStyle: 'long' })
  const supabase = await createClient()

  // RLS also scopes this to the caller's own rows for a regular employee,
  // but a @kawa.coffee staff account matches the staff read-all policy too
  // (support/oversight) — filter explicitly so a staff preview of this page
  // doesn't show every salarié's subscriptions (same fix as /compte/commandes).
  const { data: subscriptions, error } = await supabase
    .from('product_subscriptions')
    .select(
      'id, quantity, grind_type, frequency_weeks, active, next_reminder_at, product:products(id, name, name_en, image_url, category, price, active, in_stock)'
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
        <h1 className="text-2xl font-bold text-kawa-800">{t.abonnements.title}</h1>
        <p className="text-kawa-500 mt-1">{t.abonnements.subtitle}</p>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-2xl border border-kawa-200 p-10 text-center">
          <p className="text-kawa-500">{t.abonnements.empty}</p>
          <Link href="/compte/produits/cafes" className="text-sky-700 hover:underline text-sm mt-2 inline-block">
            {t.abonnements.seeCoffees}
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
                      alt={(locale === 'en' && product.name_en) || product.name}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-kawa-800">
                    {(locale === 'en' && product.name_en) || product.name}
                    {sub.grind_type && (
                      <span className="text-kawa-500 font-normal">
                        {' '}
                        — {grindLabel(sub.grind_type, locale)}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-kawa-500">
                    {t.abonnements.quantityPrefix} {sub.quantity} ·{' '}
                    {frequencyLabel(sub.frequency_weeks, locale) ??
                      t.abonnements.weeklyFallback(sub.frequency_weeks)}
                  </p>
                  {!product.active || !product.in_stock ? (
                    <p className="text-xs text-red-600 mt-0.5">{t.abonnements.unavailableNotice}</p>
                  ) : (
                    <p className="text-xs text-kawa-400 mt-0.5">
                      {sub.active
                        ? t.abonnements.nextReminder(dateFormat.format(new Date(sub.next_reminder_at)))
                        : t.abonnements.paused}
                    </p>
                  )}
                </div>
                <SubscriptionRow id={sub.id} active={sub.active} t={t.abonnements} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
