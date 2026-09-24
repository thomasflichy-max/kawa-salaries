'use server'

import { createClient } from '@/lib/supabase/server'
import { PICKUP_SLOT_HOURS, upcomingWeekdays, formatPickupSlot } from '@/lib/pickup-slot'
import { notifyStaffDevices } from '@/lib/push-notifications'
import { logSecurityEvent } from '@/lib/log-security-event'

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

  if (result.was_change) {
    // A slot was already chosen and the salarié just picked a different
    // one — log this persistently (Account Management feed), not just a
    // push, so it can't silently go unnoticed if the push is missed.
    const previousLabel = formatPickupSlot(result.previous_date, result.previous_hour)
    logSecurityEvent(supabase, {
      eventType: 'pickup_slot_changed',
      email: result.employee_email,
      detail: `${result.order_number} : ${previousLabel} → ${slotLabel}`,
      url: `/admin/commandes/${result.order_id}`,
    })
  } else {
    notifyStaffDevices(supabase, {
      title: 'Créneau de retrait choisi',
      body: `${result.employee_name} — ${result.order_number} : ${slotLabel}`,
      url: `/admin/commandes/${result.order_id}`,
    }).catch((pushError) => console.error('[setPickupSlotAction] push notification failed:', pushError))
  }

  return { success: true }
}
