import { CreateOrganizationForm } from '@/app/admin/create-organization-form'

export default function AdminAddClientPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-kawa-800">Ajouter un client</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Onboarding d&apos;une nouvelle entreprise cliente : nom, domaine email, mail type d&apos;un
          salarié et lieu de livraison.
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 p-6">
        <CreateOrganizationForm />
      </section>
    </div>
  )
}
