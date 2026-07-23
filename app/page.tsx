import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignupForm } from '@/app/signup-form'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/compte/avantage')
  }

  return (
    <main className="min-h-screen bg-kawa-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-kawa-800">Espace salariés</h1>
          <p className="text-kawa-500 mt-2">Accédez à vos avantages KAWA</p>
        </div>

        <SignupForm />

        <p className="text-center text-sm text-kawa-400 mt-6">
          Déjà un compte ?{' '}
          <Link href="/connexion" className="text-sky-700 underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
