import Link from 'next/link'
import { getEmployee } from '@/lib/get-employee'
import { logout } from '@/app/actions/auth'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { ChangePasswordForm } from './change-password-form'
import { ProfileForm } from './profile-form'
import { DefaultAddressForm } from './default-address-form'
import { MarketingPreferenceForm } from './marketing-preference-form'
import { PaymentMethodBadges } from './payment-method-badges'

export default async function ComptePage() {
  const { user, profile, organization, organizationAddresses } = await getEmployee()
  const t = getDictionary(await getLocale())

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">{t.nav.compte}</h1>
        <p className="text-kawa-500 mt-1">
          {t.compte.greeting(profile?.full_name ?? user.email ?? '')}
        </p>
      </div>

      <dl className="flex flex-col gap-4 text-sm max-w-sm">
        <div className="flex justify-between border-b border-kawa-100 pb-4">
          <dt className="text-kawa-500">{t.compte.emailLabel}</dt>
          <dd className="text-kawa-800 font-medium">{user.email}</dd>
        </div>
        <div className="flex justify-between pb-1">
          <dt className="text-kawa-500">{t.compte.companyLabel}</dt>
          <dd className="text-kawa-800 font-medium">{organization?.name ?? '—'}</dd>
        </div>
      </dl>

      <div>
        <h2 className="text-lg font-semibold text-kawa-800 mb-4">{t.compte.profileTitle}</h2>
        <ProfileForm
          fullName={profile?.full_name ?? null}
          billingAddress={profile?.billing_address ?? null}
          t={t.profileForm}
          common={t.common}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-kawa-800 mb-4">{t.compte.deliveryTitle}</h2>
        <DefaultAddressForm
          addresses={organizationAddresses}
          defaultAddressId={profile?.default_address_id ?? null}
          t={t.addressForm}
          retraitOption={t.checkout.retraitOption}
          common={t.common}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-kawa-800 mb-4">{t.compte.subscriptionTitle}</h2>
        <div className="bg-white rounded-2xl border border-kawa-200 p-6 max-w-sm flex items-center justify-between gap-4">
          <p className="text-sm text-kawa-500">{t.compte.subscriptionBody}</p>
          <Link
            href="/compte/abonnements"
            className="shrink-0 text-sm text-sky-700 hover:underline whitespace-nowrap"
          >
            {t.compte.manage}
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-kawa-800 mb-4">{t.compte.communicationsTitle}</h2>
        <MarketingPreferenceForm
          optedOut={profile?.marketing_opt_out ?? false}
          t={t.marketingForm}
          common={t.common}
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-kawa-800 mb-4">{t.compte.passwordTitle}</h2>
        <ChangePasswordForm t={t.passwordForm} inputLabels={t.passwordInput} />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-kawa-800 mb-4">{t.compte.paymentTitle}</h2>
        <div className="bg-white rounded-2xl border border-kawa-200 p-6 max-w-sm">
          <p className="text-sm text-kawa-500">{t.compte.paymentBody}</p>
          <PaymentMethodBadges />
        </div>
      </div>

      <form action={logout} className="max-w-sm">
        <button className="w-full border border-kawa-200 text-kawa-600 py-2 rounded-lg font-medium hover:bg-kawa-50 transition">
          {t.compte.logout}
        </button>
      </form>
    </div>
  )
}
