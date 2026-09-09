import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { createClient } from '@/lib/supabase/server'
import { KAWA_OFFICE } from '@/app/admin/demo-data'
import { PICKUP_HOURS_NOTE } from '@/lib/emails/shared'
import { upcomingWeekdays } from '@/lib/pickup-slot'
import { PickupScheduler } from './pickup-scheduler'

// Public scheduling page reached from the "commande prête" email. The ?t=
// token is orders.pickup_token, checked by the get/set_pickup_slot RPCs.
export default async function RetraitPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams

  let order: {
    order_number: string
    delivery_mode: string
    pickup_slot_date: string | null
    pickup_slot_hour: number | null
  } | null = null

  if (t) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_pickup_slot', { p_token: t })
    if (error) console.error('[retrait] get_pickup_slot failed:', error)
    order = data?.[0] ?? null
  }

  return (
    <div className="min-h-screen bg-kawa-50">
      <LegalHeader />
      <main className="flex justify-center px-6 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-kawa-200 p-8 flex flex-col gap-5">
          {!order || order.delivery_mode !== 'pickup' ? (
            <>
              <h1 className="text-2xl font-bold text-kawa-800">Lien invalide</h1>
              <p className="text-kawa-600 text-sm leading-relaxed">
                Ce lien de prise de rendez-vous n&apos;est pas valide, ou cette commande n&apos;est
                pas un retrait au bureau KAWA.
              </p>
              <Link href="/compte/commandes" className="text-sky-700 underline text-sm">
                Voir mes commandes
              </Link>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-2xl font-bold text-kawa-800">Programmer mon passage</h1>
                <p className="text-kawa-500 text-sm mt-1">Commande {order.order_number}</p>
              </div>
              <div className="rounded-xl bg-kawa-50 border border-kawa-200 p-4 text-sm">
                <p className="text-kawa-500 text-xs uppercase tracking-wide">Retrait</p>
                <p className="text-kawa-800 mt-0.5">{KAWA_OFFICE.address}</p>
                <p className="text-kawa-500 mt-1 text-xs">{PICKUP_HOURS_NOTE}</p>
              </div>
              <PickupScheduler
                token={t as string}
                dates={upcomingWeekdays(30)}
                currentDate={order.pickup_slot_date}
                currentHour={order.pickup_slot_hour}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
