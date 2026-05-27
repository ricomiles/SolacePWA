/**
 * sw-push.js — Push event handlers for the Solace service worker.
 *
 * This file lives in /public so it is served as a static asset.
 * It is imported by the Workbox-generated service worker via vite.config.js:
 *
 *   VitePWA({
 *     workbox: {
 *       importScripts: ['/sw-push.js'],
 *       // ...rest of workbox config
 *     },
 *   })
 *
 * DO NOT modify this file's import path without updating vite.config.js.
 */

self.addEventListener('push', (event) => {
  if (!event.data) return

  let payload
  try {
    payload = event.data.json()
  } catch {
    payload = { title: 'Solace', body: event.data.text(), url: '/' }
  }

  const { title = 'Solace', body = '', url = '/' } = payload

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      vibrate: [100, 50, 100],
      data: { url },
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const targetUrl = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If the app is already open, focus that window.
        for (const client of clientList) {
          const clientUrl = new URL(client.url)
          if (clientUrl.origin === self.location.origin) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        // Otherwise open a new window.
        return self.clients.openWindow(targetUrl)
      }),
  )
})
