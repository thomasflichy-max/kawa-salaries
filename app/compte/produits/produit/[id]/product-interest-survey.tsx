'use client'

import { useState, useTransition } from 'react'
import { toggleProductInterestAction } from '@/app/actions/product-interest'
import type { Dictionary } from '@/lib/i18n/dictionary'

export function ProductInterestSurvey({
  productId,
  initialInterested,
  t,
}: {
  productId: string
  initialInterested: boolean
  t: Dictionary['interestSurvey']
}) {
  const [interested, setInterested] = useState(initialInterested)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleProductInterestAction(productId)
      if (!result.error) setInterested(result.interested)
    })
  }

  const [beforeSize, afterSize] = t.question.split('200 g')

  return (
    <div className="rounded-xl border border-kawa-200 bg-kawa-50 p-4 flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-kawa-700">
        {beforeSize}
        <strong>200 g</strong>
        {afterSize}
      </p>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
          interested
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-sky-500 text-kawa-950 hover:bg-sky-600'
        }`}
      >
        {interested ? t.interestedConfirmed : t.interestedYes}
      </button>
    </div>
  )
}
