'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { markSecurityEventsSeen } from './actions'

// Invisible — marks the channel as read on mount, same idiom as
// app/admin/inscriptions/mark-seen.tsx.
export function MarkSeen() {
  const router = useRouter()

  useEffect(() => {
    markSecurityEventsSeen().then(() => router.refresh())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only, router is a stable reference
  }, [])

  return null
}
