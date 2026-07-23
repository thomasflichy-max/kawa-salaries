'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'

export type AuthFormState = { error: string } | undefined

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function signup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')
  const billingAddress = String(formData.get('billingAddress') ?? '').trim()

  if (!firstName || !lastName) {
    return { error: 'Merci de renseigner votre prénom et votre nom.' }
  }
  if (!isValidEmail(email)) {
    return { error: 'Adresse email invalide.' }
  }
  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }
  if (!billingAddress) {
    return { error: 'Merci de renseigner votre adresse de facturation.' }
  }

  const domain = email.split('@')[1]
  const supabase = await createClient()

  const { data: org, error: orgError } = await supabase
    .rpc('find_organization_by_domain', { input_domain: domain })
    .maybeSingle()

  if (orgError) {
    console.error('[signup] find_organization_by_domain failed:', orgError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }
  if (!org) {
    return {
      error: `${domain} n'est pas (encore) une entreprise cliente kawa. Contactez votre RH si vous pensez qu'il s'agit d'une erreur.`,
    }
  }

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        organization_id: org.id,
        billing_address: billingAddress,
      },
    },
  })

  if (signUpError) {
    console.error('[signup] auth.signUp failed:', signUpError)
    return {
      error:
        signUpError.code === 'user_already_exists'
          ? 'Un compte existe déjà avec cet email.'
          : 'Une erreur est survenue, merci de réessayer.',
    }
  }

  // If email confirmation is disabled on the project, signUp already returns
  // an active session; otherwise the user must confirm by email first.
  redirect(signUpData.session ? '/compte' : '/inscription/confirmation')
}

// Staff (@kawa.coffee) can't go through the regular signup flow above — it
// requires the email's domain to match a client organization, and kawa.coffee
// is KAWA's own domain, not a client's. This is the only way an admin email
// (KAWA_ADMIN_EMAILS) can get an initial account/password, since there's no
// invite flow — gated by the same allowlist as /admin itself rather than an
// organization lookup.
export async function adminSignup(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')

  if (!isValidEmail(email)) {
    return { error: 'Adresse email invalide.' }
  }
  if (password.length < 8) {
    return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
  }
  if (!isKawaStaffEmail(email)) {
    return {
      error:
        "Cette adresse n'est pas autorisée pour l'accès admin. Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.",
    }
  }

  const supabase = await createClient()
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    console.error('[adminSignup] auth.signUp failed:', signUpError)
    return {
      error:
        signUpError.code === 'user_already_exists'
          ? 'Un compte existe déjà avec cet email — utilisez "Mot de passe oublié" sur la page de connexion.'
          : 'Une erreur est survenue, merci de réessayer.',
    }
  }

  // If email confirmation is disabled on the project, signUp already returns
  // an active session; otherwise the user must confirm by email first.
  redirect(signUpData.session ? '/admin' : '/inscription/confirmation')
}

export async function login(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')
  const next = String(formData.get('next') ?? '/compte/avantage')

  if (!isValidEmail(email) || !password) {
    return { error: 'Email ou mot de passe invalide.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error('[login] signInWithPassword failed:', error)
    return { error: 'Email ou mot de passe incorrect.' }
  }

  redirect(next || '/compte/avantage')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/connexion')
}

export type RequestPasswordResetState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

export async function requestPasswordReset(
  _prevState: RequestPasswordResetState,
  formData: FormData
): Promise<RequestPasswordResetState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()

  if (!isValidEmail(email)) {
    return { error: 'Adresse email invalide.' }
  }

  const headersList = await headers()
  const origin = headersList.get('origin') ?? `https://${headersList.get('host')}`

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/mot-de-passe-oublie/nouveau`,
  })

  if (error) {
    console.error('[requestPasswordReset] resetPasswordForEmail failed:', error)
  }

  // Always report success, whether or not the email exists — otherwise this
  // endpoint could be used to check which emails have an account.
  return { success: true }
}

export type UpdateProfileState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

export async function updateProfile(
  _prevState: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const fullName = String(formData.get('fullName') ?? '').trim()
  const billingAddress = String(formData.get('billingAddress') ?? '').trim()

  if (!fullName) {
    return { error: 'Le nom ne peut pas être vide.' }
  }
  if (!billingAddress) {
    return { error: "L'adresse de facturation ne peut pas être vide." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Session expirée, merci de vous reconnecter.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ full_name: fullName, billing_address: billingAddress })
    .eq('id', user.id)

  if (error) {
    console.error('[updateProfile] update failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  return { success: true }
}

export type UpdateDefaultAddressState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

export async function updateDefaultAddress(
  _prevState: UpdateDefaultAddressState,
  formData: FormData
): Promise<UpdateDefaultAddressState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Session expirée, merci de vous reconnecter.' }
  }

  const addressId = String(formData.get('default_address_id') ?? '').trim()

  if (addressId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    // Defense-in-depth: the dropdown only ever lists the employee's own
    // organization's sites, but don't trust that client-side.
    const { data: address } = await supabase
      .from('organization_addresses')
      .select('organization_id')
      .eq('id', addressId)
      .maybeSingle()

    if (!address || address.organization_id !== profile?.organization_id) {
      return { error: 'Site invalide.' }
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ default_address_id: addressId || null })
    .eq('id', user.id)

  if (error) {
    console.error('[updateDefaultAddress] update failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  return { success: true }
}

export type UpdatePasswordState = { error: string; success?: false } | { success: true; error?: undefined } | undefined

export async function updatePassword(
  _prevState: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (newPassword.length < 8) {
    return { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Les deux mots de passe ne correspondent pas.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: 'Session expirée, merci de vous reconnecter.' }
  }

  // Re-verify the current password before allowing the change, rather than
  // trusting the existing session alone (e.g. an unlocked shared browser).
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })
  if (reauthError) {
    return { error: 'Mot de passe actuel incorrect.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (updateError) {
    console.error('[updatePassword] auth.updateUser failed:', updateError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  return { success: true }
}
