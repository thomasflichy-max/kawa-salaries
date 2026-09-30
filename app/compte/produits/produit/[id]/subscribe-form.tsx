'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { createSubscription } from '@/app/actions/subscriptions'
import { FREQUENCY_WEEKS, frequencyLabel } from '@/lib/subscription-frequency'
import { GRIND_OPTIONS } from '@/lib/grind-type'
import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/locale'

export function SubscribeForm({
  productId,
  showGrind = false,
  t,
  locale,
}: {
  productId: string
  showGrind?: boolean
  t: Dictionary['subscribe']
  locale: Locale
}) {
  const [open, setOpen] = useState(false)
  const [grind, setGrind] = useState<(typeof GRIND_OPTIONS)[number]['value']>('grain')
  const [state, action, pending] = useActionState(createSubscription, undefined)

  if (state && 'success' in state) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        {t.successPrefix}{' '}
        <Link href="/compte/abonnements" className="underline font-medium">
          {t.manageLink}
        </Link>
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-lg font-medium border-2 border-sky-500 text-sky-700 hover:bg-sky-50 transition"
      >
        {t.createCta}
      </button>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3 border border-kawa-200 rounded-lg p-4">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="quantity" value={1} />
      {showGrind && <input type="hidden" name="grind_type" value={grind} />}

      <p className="text-sm font-medium text-kawa-700">{t.title}</p>
      <p className="text-xs text-kawa-400 -mt-1">{t.description}</p>

      {showGrind && (
        <div>
          <label className="text-xs text-kawa-500">{t.grindLabel}</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {GRIND_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGrind(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  grind === option.value
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-kawa-200 text-kawa-600 hover:border-kawa-300'
                }`}
              >
                {locale === 'en' ? option.labelEn : option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-kawa-500">{t.frequencyLabel}</label>
        <select
          name="frequency_weeks"
          defaultValue={4}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          {FREQUENCY_WEEKS.map((weeks) => (
            <option key={weeks} value={weeks}>
              {frequencyLabel(weeks, locale)}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
        >
          {pending ? t.submitting : t.submit}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-kawa-500 hover:underline"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  )
}
