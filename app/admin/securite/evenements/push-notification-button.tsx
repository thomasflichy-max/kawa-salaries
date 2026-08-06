'use client'

import { useEffect, useState } from 'react'
import { subscribeToPush, unsubscribeFromPush } from './push-actions'

// Standard base64url -> Uint8Array conversion required by pushManager.subscribe's
// applicationServerKey — the VAPID public key is handed out as base64url text.
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

type Status = 'checking' | 'unsupported' | 'off' | 'on'

export function PushNotificationButton() {
  const [status, setStatus] = useState<Status>('checking')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported')
      return
    }
    navigator.serviceWorker.register('/sw.js').then(async (registration) => {
      const existing = await registration.pushManager.getSubscription()
      setStatus(existing ? 'on' : 'off')
    })
  }, [])

  async function handleEnable() {
    setError(null)
    setPending(true)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setError('Autorisation refusée dans le navigateur.')
        return
      }
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      })
      const result = await subscribeToPush(subscription.toJSON() as never)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setStatus('on')
    } catch (err) {
      console.error('[PushNotificationButton] enable failed:', err)
      setError("L'activation a échoué, merci de réessayer.")
    } finally {
      setPending(false)
    }
  }

  async function handleDisable() {
    setError(null)
    setPending(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await unsubscribeFromPush(subscription.endpoint)
        await subscription.unsubscribe()
      }
      setStatus('off')
    } catch (err) {
      console.error('[PushNotificationButton] disable failed:', err)
      setError('La désactivation a échoué, merci de réessayer.')
    } finally {
      setPending(false)
    }
  }

  if (status === 'checking') return null
  if (status === 'unsupported') return null

  return (
    <div className="flex items-center gap-2">
      {status === 'off' ? (
        <button
          type="button"
          onClick={handleEnable}
          disabled={pending}
          className="text-sm text-sky-700 hover:underline disabled:opacity-50"
        >
          🔔 Activer les notifications sur cet appareil
        </button>
      ) : (
        <button
          type="button"
          onClick={handleDisable}
          disabled={pending}
          className="text-sm text-kawa-500 hover:underline disabled:opacity-50"
        >
          🔕 Désactiver les notifications sur cet appareil
        </button>
      )}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
