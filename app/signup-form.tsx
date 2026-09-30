'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions/auth'
import { PasswordInput } from '@/app/password-input'
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy'
import type { Dictionary } from '@/lib/i18n/dictionary'

export function SignupForm({
  t,
  passwordForm,
  passwordInput,
}: {
  t: Dictionary['signupForm']
  passwordForm: Dictionary['passwordForm']
  passwordInput: Dictionary['passwordInput']
}) {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-kawa-700">{t.firstName}</label>
        <input
          type="text"
          name="firstName"
          placeholder="Sophie"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">{t.lastName}</label>
        <input
          type="text"
          name="lastName"
          placeholder="Martin"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">{t.workEmail}</label>
        <input
          type="email"
          name="email"
          placeholder="sophie.martin@entreprise.fr"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">{t.password}</label>
        <PasswordInput
          name="password"
          placeholder="••••••••"
          required
          minLength={PASSWORD_MIN_LENGTH}
          labels={passwordInput}
        />
        <p className="text-xs text-kawa-400 mt-1">{passwordForm.minLength(PASSWORD_MIN_LENGTH)}</p>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">{t.billingAddress}</label>
        <textarea
          name="billingAddress"
          placeholder="12 rue de la Paix, 44000 Nantes"
          rows={2}
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <p className="text-xs text-kawa-400 mt-1">{t.billingAddressHint}</p>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? t.creating : t.submit}
      </button>
    </form>
  )
}
