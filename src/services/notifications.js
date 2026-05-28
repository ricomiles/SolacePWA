import { supabase } from '../supabaseClient'

/**
 * Convert a base64url VAPID public key to a Uint8Array for
 * PushManager.subscribe({ applicationServerKey }).
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

// Convert "HH:MM" local time string to "HH:00" UTC string for server-side matching
function localTimeToUTC(localTime) {
  const [h, m] = localTime.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d.getUTCHours().toString().padStart(2, '0') + ':00'
}

/**
 * Ask the browser for Notification permission.
 * Returns true if granted, false otherwise.
 */
export async function requestPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

/**
 * Subscribe the current device to push notifications and persist
 * the subscription to the `push_subscriptions` Supabase table.
 *
 * @param {string} userId
 * @param {string} reminderTime  e.g. "21:00"
 * @param {boolean} streakNudge
 */
export async function subscribeToPush(userId, reminderTime, streakNudge) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    throw new Error('Push notifications are not supported in this browser.')
  }

  const registration = await navigator.serviceWorker.ready

  const applicationServerKey = urlBase64ToUint8Array(
    import.meta.env.VITE_VAPID_PUBLIC_KEY,
  )

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey,
  })

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      subscription: subscription.toJSON(),
      reminder_time: localTimeToUTC(reminderTime),
      streak_nudge: streakNudge,
    },
    { onConflict: 'user_id' },
  )

  if (error) throw error

  return subscription
}

/**
 * Unsubscribe the current device from push notifications and remove
 * the record from Supabase.
 *
 * @param {string} userId
 */
export async function unsubscribeFromPush(userId) {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      await subscription.unsubscribe()
    }
  }

  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Update reminder settings for an existing push subscription.
 * The push subscription endpoint itself is unchanged; only metadata is updated.
 *
 * @param {string} userId
 * @param {string} reminderTime  e.g. "20:00"
 * @param {boolean} streakNudge
 */
export async function updateReminderSettings(userId, reminderTime, streakNudge) {
  const { error } = await supabase
    .from('push_subscriptions')
    .update({ reminder_time: localTimeToUTC(reminderTime), streak_nudge: streakNudge })
    .eq('user_id', userId)

  if (error) throw error
}

/**
 * Returns the current push subscription row for a user, or null if none exists.
 *
 * @param {string} userId
 */
export async function fetchSubscription(userId) {
  const { data, error } = await supabase
    .from('push_subscriptions')
    .select('reminder_time, streak_nudge')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

/**
 * Returns true if this device currently has an active push subscription
 * registered with the browser's PushManager.
 */
export async function isSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  return subscription !== null
}
