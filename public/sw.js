// Minimal service worker whose only job is to turn a push message into an
// OS-level notification (macOS Notification Center, etc.) and focus/open
// the admin channel when clicked. No caching/offline behavior — this app
// isn't a PWA otherwise, this is purely for Web Push.

self.addEventListener('push', (event) => {
  let data = { title: 'KAWA admin', body: '' }
  try {
    data = event.data.json()
  } catch {
    data.body = event.data ? event.data.text() : ''
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon.png',
      data: { url: data.url || '/admin/securite/evenements' },
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/admin/securite/evenements'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(url)
      }
    })
  )
})
