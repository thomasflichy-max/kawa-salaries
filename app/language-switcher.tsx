'use client'

import { useTransition } from 'react'
import { setLocaleAction } from '@/lib/i18n/actions'
import type { Locale } from '@/lib/i18n/locale'

export function LanguageSwitcher({ locale, labels }: { locale: Locale; labels: { fr: string; en: string } }) {
  const [pending, startTransition] = useTransition()

  function choose(next: Locale) {
    if (next === locale || pending) return
    startTransition(() => {
      setLocaleAction(next)
    })
  }

  return (
    <div className="inline-flex items-center rounded-full border border-kawa-200 bg-white p-0.5 text-xs font-medium">
      {(['fr', 'en'] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => choose(option)}
          disabled={pending}
          aria-current={locale === option}
          className={`px-2.5 py-1 rounded-full transition disabled:opacity-60 ${
            locale === option ? 'bg-sky-500 text-kawa-950' : 'text-kawa-500 hover:text-kawa-800'
          }`}
        >
          {labels[option]}
        </button>
      ))}
    </div>
  )
}
