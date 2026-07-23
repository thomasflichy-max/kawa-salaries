import type { EmailOtpType } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Every Supabase auth email (password recovery, signup confirmation...)
// links here first. The @supabase/ssr browser client can't reliably turn
// the URL's token into a session on its own (that auto-detection is a
// supabase-js browser-storage behavior, not guaranteed with the
// cookie-backed SSR client) — verifying server-side and writing the session
// cookie here is the pattern Supabase documents for Next.js SSR apps.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  if (tokenHash && type) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      redirect(next)
    }
  }

  // Recovery links fail into the "forgot password" form (right place to
  // retry that specific flow) — everything else (signup confirmation...)
  // falls back to /connexion, which has its own generic error message.
  redirect(type === 'recovery' ? '/mot-de-passe-oublie?erreur=lien_invalide' : '/connexion?erreur=lien_invalide')
}
