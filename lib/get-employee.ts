import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getEmployee() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion?next=/compte')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, organization_id')
    .eq('id', user.id)
    .single()

  const { data: organization, error: organizationError } = profile?.organization_id
    ? await supabase
        .from('organizations')
        .select('name, discount_rate')
        .eq('id', profile.organization_id)
        .single()
    : { data: null, error: null }

  if (organizationError) {
    console.error('[compte] failed to load organization:', organizationError)
  }

  return { user, profile, organization }
}
