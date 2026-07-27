'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'

async function requireStaffEmail() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    throw new Error('Non autorisé.')
  }

  return { supabase, staffEmail: user!.email! }
}

// Toggles the current staff member's own reaction — add it if they haven't
// used this emoji on this attempt yet, remove it if they have. Each staff
// member's reactions are tracked independently (unique per attempt+emoji+
// staff_email), same as Slack/Mattermost-style reactions.
export async function toggleReaction(attemptId: string, emoji: string) {
  const { supabase, staffEmail } = await requireStaffEmail()

  const { data: existing, error: fetchError } = await supabase
    .from('signup_attempt_reactions')
    .select('id')
    .eq('attempt_id', attemptId)
    .eq('emoji', emoji)
    .eq('staff_email', staffEmail)
    .maybeSingle()

  if (fetchError) {
    console.error('[toggleReaction] fetch failed:', fetchError)
    throw new Error('Une erreur est survenue, merci de réessayer.')
  }

  if (existing) {
    const { error } = await supabase.from('signup_attempt_reactions').delete().eq('id', existing.id)
    if (error) {
      console.error('[toggleReaction] delete failed:', error)
      throw new Error('Une erreur est survenue, merci de réessayer.')
    }
  } else {
    const { error } = await supabase
      .from('signup_attempt_reactions')
      .insert({ attempt_id: attemptId, emoji, staff_email: staffEmail })
    if (error) {
      console.error('[toggleReaction] insert failed:', error)
      throw new Error('Une erreur est survenue, merci de réessayer.')
    }
  }

  revalidatePath('/admin/inscriptions')
}

export async function addComment(attemptId: string, body: string) {
  const { supabase, staffEmail } = await requireStaffEmail()

  const trimmed = body.trim()
  if (!trimmed) {
    throw new Error('Le commentaire ne peut pas être vide.')
  }

  const { error } = await supabase
    .from('signup_attempt_comments')
    .insert({ attempt_id: attemptId, author_email: staffEmail, body: trimmed })

  if (error) {
    console.error('[addComment] insert failed:', error)
    throw new Error('Une erreur est survenue, merci de réessayer.')
  }

  revalidatePath('/admin/inscriptions')
}
