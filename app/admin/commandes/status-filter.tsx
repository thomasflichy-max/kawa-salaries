'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { DEMO_ORDER_STATUS_LABELS, type DemoOrderStatus } from '@/app/admin/demo-data'

const STATUS_ORDER: DemoOrderStatus[] = [
  'en_cours',
  'en_preparation',
  'pret',
  'livree',
  'annulee',
]

export function StatusFilter({ value }: { value: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(status: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (status) {
      params.set('status', status)
    } else {
      params.delete('status')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
    >
      <option value="">Tous les statuts</option>
      {STATUS_ORDER.map((status) => (
        <option key={status} value={status}>
          {DEMO_ORDER_STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  )
}
