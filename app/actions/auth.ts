'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { validatePassword } from '@/lib/password-policy'
import { isPasswordReused, recordPasswordHistory } from '@/lib/password-history'
import { logSecurityEvent } from '@/lib/log-security-event'
import { notifyStaffDevices } from '@/lib/push-notifications'

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
  const passwordError = validatePassword(password)
  if (passwordError) {
    return { error: passwordError }
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
    // Fire-and-forget: a logging failure shouldn't block the user from
    // seeing their actual error, so this isn't awaited into the response.
    supabase
      .from('signup_attempts')
      .insert({
        email,
        full_name: `${firstName} ${lastName}`,
        domain,
        success: false,
        reason: 'domain_not_recognized',
      })
      .then(({ error }) => {
        if (error) {
          console.error('[signup] failed to log signup attempt:', error)
          return
        }
        notifyStaffDevices(supabase, {
          title: 'Inscription refusée — domaine non reconnu',
          body: `${firstName} ${lastName} (${email})`,
          url: '/admin/inscriptions',
        }).catch((pushError) => console.error('[signup] push notification failed:', pushError))
      })

    return {
      error: `${domain} n'est pas (encore) une entreprise cliente KAWA. Contactez votre RH si vous pensez qu'il s'agit d'une erreur ou bien envoyez-nous un mail à nantes@kawa.coffee pour déguster nos cafés dans votre entreprise ☕️`,
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

  const { error: logError } = await supabase.from('signup_attempts').insert({
    email,
    full_name: `${firstName} ${lastName}`,
    domain,
    organization_id: org.id,
    success: true,
  })
  if (logError) {
    console.error('[signup] failed to log signup attempt:', logError)
  } else {
    notifyStaffDevices(supabase, {
      title: 'Nouvelle inscription',
      body: `${firstName} ${lastName} (${email}) — ${org.name}`,
      url: '/admin/inscriptions',
    }).catch((pushError) => console.error('[signup] push notification failed:', pushError))
  }

  if (signUpData.user) {
    await recordPasswordHistory(supabase, signUpData.user.id, password)
  }

  // If email confirmation is disabled on the project, signUp already returns
  // an active session; otherwise the user must confirm by email first.
  redirect(signUpData.session ? '/compte/avantage' : '/inscription/confirmation')
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
  const passwordError = validatePassword(password)
  if (passwordError) {
    return { error: passwordError }
  }
  const supabase = await createClient()

  if (!isKawaStaffEmail(email)) {
    logSecurityEvent(supabase, { eventType: 'admin_signup_rejected', email })
    return {
      error:
        "Cette adresse n'est pas autorisée pour l'accès admin. Contactez un administrateur si vous pensez qu'il s'agit d'une erreur.",
    }
  }

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

  if (signUpData.user) {
    await recordPasswordHistory(supabase, signUpData.user.id, password)
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
    logSecurityEvent(supabase, { eventType: 'login_failed', email, detail: error.message })
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

  const passwordError = validatePassword(newPassword)
  if (passwordError) {
    return { error: passwordError }
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

  if (await isPasswordReused(supabase, user.id, newPassword)) {
    return { error: 'Ce mot de passe a déjà été utilisé récemment, choisissez-en un autre.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (updateError) {
    console.error('[updatePassword] auth.updateUser failed:', updateError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  await recordPasswordHistory(supabase, user.id, newPassword)

  return { success: true }
}

export type SetNewPasswordState = { error: string } | undefined

// Used by the "mot de passe oublié" reset link flow (new-password-form.tsx)
// instead of calling supabase.auth.updateUser directly from the client, so
// the reuse check and history recording (server-side, needs bcrypt against
// stored hashes) can happen the same way as updatePassword above.
export async function setNewPasswordAfterReset(
  _prevState: SetNewPasswordState,
  formData: FormData
): Promise<SetNewPasswordState> {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  const passwordError = validatePassword(password)
  if (passwordError) {
    return { error: passwordError }
  }
  if (password !== confirmPassword) {
    return { error: 'Les deux mots de passe ne correspondent pas.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      error: "Le lien a peut-être expiré. Retournez sur la page précédente et recommencez.",
    }
  }

  if (await isPasswordReused(supabase, user.id, password)) {
    return { error: 'Ce mot de passe a déjà été utilisé récemment, choisissez-en un autre.' }
  }

  const { error: updateError } = await supabase.auth.updateUser({ password })
  if (updateError) {
    console.error('[setNewPasswordAfterReset] auth.updateUser failed:', updateError)
    return {
      error: "Le lien a peut-être expiré. Retournez sur la page précédente et recommencez.",
    }
  }

  await recordPasswordHistory(supabase, user.id, password)

  redirect('/compte')
}
