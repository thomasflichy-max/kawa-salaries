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
    .select('full_name, organization_id, billing_address, default_address_id')
    .eq('id', user.id)
    .single()

  const [
    { data: organization, error: organizationError },
    { data: discountRows },
    { data: addresses },
  ] = profile?.organization_id
    ? await Promise.all([
        supabase
          .from('organizations')
          .select('name')
          .eq('id', profile.organization_id)
          .single(),
        supabase
          .from('organization_coffee_discounts')
          .select('subcategory, discount_amount')
          .eq('organization_id', profile.organization_id),
        supabase
          .from('organization_addresses')
          .select('id, label, address')
          .eq('organization_id', profile.organization_id)
          .order('label'),
      ])
    : [{ data: null, error: null }, { data: null }, { data: null }]

  if (organizationError) {
    console.error('[compte] failed to load organization:', organizationError)
  }

  const coffeeDiscounts: Record<string, number> = {}
  for (const row of discountRows ?? []) {
    coffeeDiscounts[row.subcategory] = row.discount_amount
  }

  return {
    user,
    profile,
    organization,
    coffeeDiscounts,
    organizationAddresses: addresses ?? [],
  }
}
