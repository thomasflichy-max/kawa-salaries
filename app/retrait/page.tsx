import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { createClient } from '@/lib/supabase/server'
import { KAWA_OFFICE } from '@/app/admin/demo-data'
import { formatPickupSlot, upcomingWeekdays } from '@/lib/pickup-slot'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { LanguageSwitcher } from '@/app/language-switcher'
import { PickupScheduler } from './pickup-scheduler'

// Public scheduling page reached from the "commande prête" email. The ?t=
// token is orders.pickup_token, checked by the get/set_pickup_slot RPCs.
export default async function RetraitPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t: token } = await searchParams
  const locale = await getLocale()
  const dict = getDictionary(locale)
  const t = dict.retrait

  let order: {
    order_number: string
    delivery_mode: string
    status: string
    pickup_slot_date: string | null
    pickup_slot_hour: number | null
  } | null = null

  if (token) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_pickup_slot', { p_token: token })
    if (error) console.error('[retrait] get_pickup_slot failed:', error)
    order = data?.[0] ?? null
  }

  const locked = order?.status === 'livree' || order?.status === 'annulee'

  return (
    <div className="min-h-screen bg-kawa-50">
      <LegalHeader />
      <main className="flex justify-center px-6 py-16">
        <div className="max-w-md w-full flex flex-col gap-3">
          <div className="flex justify-end">
            <LanguageSwitcher locale={locale} labels={dict.switcher} />
          </div>
          <div className="bg-white rounded-2xl border border-kawa-200 p-8 flex flex-col gap-5">
            {!order || order.delivery_mode !== 'pickup' ? (
              <>
                <h1 className="text-2xl font-bold text-kawa-800">{t.invalidTitle}</h1>
                <p className="text-kawa-600 text-sm leading-relaxed">{t.invalidBody}</p>
                <Link href="/compte/commandes" className="text-sky-700 underline text-sm">
                  {t.seeOrders}
                </Link>
              </>
            ) : locked ? (
              <>
                <h1 className="text-2xl font-bold text-kawa-800">
                  {order.status === 'livree' ? t.alreadyPickedUpTitle : t.cancelledTitle}
                </h1>
                <p className="text-kawa-600 text-sm leading-relaxed">
                  {order.status === 'livree'
                    ? t.alreadyPickedUpBody(order.order_number)
                    : t.cancelledBody(order.order_number)}
                  {order.status === 'livree' &&
                    formatPickupSlot(order.pickup_slot_date, order.pickup_slot_hour, locale) &&
                    t.previousSlotNote(
                      formatPickupSlot(order.pickup_slot_date, order.pickup_slot_hour, locale)!
                    )}
                </p>
                <Link href="/compte/commandes" className="text-sky-700 underline text-sm">
                  {t.seeOrders}
                </Link>
              </>
            ) : (
              <>
                <div>
                  <h1 className="text-2xl font-bold text-kawa-800">{t.scheduleTitle}</h1>
                  <p className="text-kawa-500 text-sm mt-1">{t.orderLabel(order.order_number)}</p>
                </div>
                <div className="rounded-xl bg-kawa-50 border border-kawa-200 p-4 text-sm">
                  <p className="text-kawa-500 text-xs uppercase tracking-wide">{t.pickupLabel}</p>
                  <p className="text-kawa-800 mt-0.5">{KAWA_OFFICE.address}</p>
                  <p className="text-kawa-500 mt-1 text-xs">{t.hoursNote}</p>
                </div>
                <PickupScheduler
                  token={token as string}
                  dates={upcomingWeekdays(30)}
                  currentDate={order.pickup_slot_date}
                  currentHour={order.pickup_slot_hour}
                  t={dict.pickupScheduler}
                  locale={locale}
                />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
