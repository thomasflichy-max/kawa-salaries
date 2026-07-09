'use client'

import { useRouter } from 'next/navigation'

export function OrderRow({ id, children }: { id: string; children: React.ReactNode }) {
  const router = useRouter()

  return (
    <tr
      onClick={() => router.push(`/admin/commandes/${id}`)}
      className="border-b border-kawa-50 last:border-0 align-top cursor-pointer hover:bg-kawa-50 transition"
    >
      {children}
    </tr>
  )
}
