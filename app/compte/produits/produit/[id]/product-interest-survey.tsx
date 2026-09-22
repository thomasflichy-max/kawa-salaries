'use client'

import { useState, useTransition } from 'react'
import { toggleProductInterestAction } from '@/app/actions/product-interest'

export function ProductInterestSurvey({
  productId,
  initialInterested,
}: {
  productId: string
  initialInterested: boolean
}) {
  const [interested, setInterested] = useState(initialInterested)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const result = await toggleProductInterestAction(productId)
      if (!result.error) setInterested(result.interested)
    })
  }

  return (
    <div className="rounded-xl border border-kawa-200 bg-kawa-50 p-4 flex items-center justify-between gap-4 flex-wrap">
      <p className="text-sm text-kawa-700">
        Le format <strong>200 g</strong> de ce café vous intéresserait-il ?
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
        {interested ? '✓ Merci, c’est noté' : "Oui, ça m’intéresse"}
      </button>
    </div>
  )
}
