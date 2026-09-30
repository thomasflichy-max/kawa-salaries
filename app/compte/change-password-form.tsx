'use client'

import { useActionState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { updatePassword } from '@/app/actions/auth'
import { PasswordInput } from '@/app/password-input'
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy'
import type { Dictionary } from '@/lib/i18n/dictionary'

export function ChangePasswordForm({
  t,
  inputLabels,
}: {
  t: Dictionary['passwordForm']
  inputLabels: Dictionary['passwordInput']
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(updatePassword, undefined)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4 max-w-sm">
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-kawa-700">{t.currentPassword}</label>
          <Link href="/mot-de-passe-oublie" className="text-xs text-sky-700 underline">
            {t.forgotPassword}
          </Link>
        </div>
        <PasswordInput name="currentPassword" required labels={inputLabels} />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">{t.newPassword}</label>
        <PasswordInput
          name="newPassword"
          required
          minLength={PASSWORD_MIN_LENGTH}
          labels={inputLabels}
        />
        <p className="text-xs text-kawa-400 mt-1">{t.minLength}</p>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">{t.confirmPassword}</label>
        <PasswordInput
          name="confirmPassword"
          required
          minLength={PASSWORD_MIN_LENGTH}
          labels={inputLabels}
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          {t.updated}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? t.updating : t.submit}
      </button>
    </form>
  )
}
