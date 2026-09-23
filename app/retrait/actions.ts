'use server'

import { createClient } from '@/lib/supabase/server'
import { PICKUP_SLOT_HOURS, upcomingWeekdays, formatPickupSlot } from '@/lib/pickup-slot'
import { notifyStaffDevices } from '@/lib/push-notifications'

export type SetPickupSlotState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

export async function setPickupSlotAction(
  _prevState: SetPickupSlotState,
  formData: FormData
): Promise<SetPickupSlotState> {
  const token = String(formData.get('token') ?? '')
  const date = String(formData.get('date') ?? '')
  const hour = Number(formData.get('hour'))

  const allowedDates = new Set(upcomingWeekdays(30))
  const allowedHours: readonly number[] = PICKUP_SLOT_HOURS
  if (!token || !allowedDates.has(date) || !allowedHours.includes(hour)) {
    return { error: 'Créneau invalide, merci de réessayer.' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('set_pickup_slot', {
    p_token: token,
    p_date: date,
    p_hour: hour,
  })

  const result = data?.[0]
  if (error || !result) {
    console.error('[setPickupSlotAction] rpc failed:', error)
    return { error: "Ce lien n'est plus valide ou le créneau n'a pas pu être enregistré." }
  }

  const slotLabel = formatPickupSlot(date, hour)
  notifyStaffDevices(supabase, {
    title: 'Créneau de retrait choisi',
    body: `${result.employee_name} — ${result.order_number} : ${slotLabel}`,
    url: `/admin/commandes/${result.order_id}`,
  }).catch((pushError) => console.error('[setPickupSlotAction] push notification failed:', pushError))

  return { success: true }
}
