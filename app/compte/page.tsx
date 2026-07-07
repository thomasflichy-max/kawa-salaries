import { getEmployee } from '@/lib/get-employee'
import { logout } from '@/app/actions/auth'
import { ChangePasswordForm } from './change-password-form'
import { ProfileForm } from './profile-form'

export default async function ComptePage() {
  const { user, profile, organization } = await getEmployee()

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">Mon Compte</h1>
        <p className="text-kawa-500 mt-1">
          Bonjour {profile?.full_name ?? user.email}
        </p>
      </div>

      <dl className="flex flex-col gap-4 text-sm max-w-sm">
        <div className="flex justify-between border-b border-kawa-100 pb-4">
          <dt className="text-kawa-500">Email</dt>
          <dd className="text-kawa-800 font-medium">{user.email}</dd>
        </div>
        <div className="flex justify-between pb-1">
          <dt className="text-kawa-500">Entreprise</dt>
          <dd className="text-kawa-800 font-medium">{organization?.name ?? '—'}</dd>
        </div>
      </dl>

      <div>
        <h2 className="text-lg font-semibold text-kawa-800 mb-4">Mon profil</h2>
        <ProfileForm fullName={profile?.full_name ?? null} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-kawa-800 mb-4">Changer de mot de passe</h2>
        <ChangePasswordForm />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-kawa-800 mb-4">Moyens de paiement</h2>
        <div className="bg-white rounded-2xl border border-kawa-200 p-6 max-w-sm">
          <p className="text-sm text-kawa-500">
            Bientôt disponible — l&apos;ajout d&apos;un moyen de paiement sera possible dès
            l&apos;intégration du paiement CAWL (Crédit Agricole).
          </p>
        </div>
      </div>

      <form action={logout} className="max-w-sm">
        <button className="w-full border border-kawa-200 text-kawa-600 py-2 rounded-lg font-medium hover:bg-kawa-50 transition">
          Se déconnecter
        </button>
      </form>
    </div>
  )
}
