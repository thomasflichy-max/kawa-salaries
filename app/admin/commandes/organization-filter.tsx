'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export function OrganizationFilter({
  value,
  organizations,
}: {
  value: string
  organizations: string[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleChange(organization: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (organization) {
      params.set('entreprise', organization)
    } else {
      params.delete('entreprise')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      className="border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
    >
      <option value="">Toutes les entreprises</option>
      {organizations.map((name) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  )
}
