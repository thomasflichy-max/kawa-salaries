'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { markInscriptionsSeen } from './actions'

// Invisible — just marks the channel as read on mount, then refreshes so
// the unread badge in AdminNav (which reads the same cookie server-side)
// clears immediately instead of only on the next navigation.
export function MarkSeen() {
  const router = useRouter()

  useEffect(() => {
    markInscriptionsSeen().then(() => router.refresh())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount only, router is a stable reference
  }, [])

  return null
}
