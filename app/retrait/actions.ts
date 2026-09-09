'use server'

import { createClient } from '@/lib/supabase/server'
import { PICKUP_SLOT_HOURS, upcomingWeekdays } from '@/lib/pickup-slot'

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

  if (error || !data) {
    console.error('[setPickupSlotAction] rpc failed:', error)
    return { error: "Ce lien n'est plus valide ou le créneau n'a pas pu être enregistré." }
  }

  return { success: true }
}
