'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import type { DateRangePreset } from './date-range'

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: 'week', label: '7 derniers jours' },
  { key: 'month', label: 'Ce mois-ci' },
  { key: 'year', label: 'Cette année' },
]

export function DateRangePicker({
  preset,
  from,
  to,
}: {
  preset: DateRangePreset
  from: string
  to: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [customFrom, setCustomFrom] = useState(from)
  const [customTo, setCustomTo] = useState(to)

  function applyPreset(key: DateRangePreset) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('preset', key)
    params.delete('from')
    params.delete('to')
    router.push(`${pathname}?${params.toString()}`)
  }

  function applyCustom() {
    if (!customFrom || !customTo) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('from', customFrom)
    params.set('to', customTo)
    params.delete('preset')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {PRESETS.map((p) => (
        <button
          key={p.key}
          onClick={() => applyPreset(p.key)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
            preset === p.key
              ? 'bg-sky-500 text-kawa-950'
              : 'bg-white border border-kawa-200 text-kawa-600 hover:bg-kawa-100'
          }`}
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-2 bg-white border border-kawa-200 rounded-lg px-2 py-1">
        <input
          type="date"
          value={customFrom}
          onChange={(e) => setCustomFrom(e.target.value)}
          className="text-sm text-kawa-700 focus:outline-none"
        />
        <span className="text-kawa-400 text-sm">→</span>
        <input
          type="date"
          value={customTo}
          onChange={(e) => setCustomTo(e.target.value)}
          className="text-sm text-kawa-700 focus:outline-none"
        />
        <button
          onClick={applyCustom}
          className={`px-2 py-1 rounded-md text-sm font-medium transition ${
            preset === 'custom'
              ? 'bg-sky-500 text-kawa-950'
              : 'bg-kawa-100 text-kawa-600 hover:bg-kawa-200'
          }`}
        >
          Appliquer
        </button>
      </div>
    </div>
  )
}
