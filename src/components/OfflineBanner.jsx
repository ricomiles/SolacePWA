import { useState, useEffect } from 'react'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div
      style={{
        background: 'var(--bg-deep)',
        borderBottom: '1px solid var(--hairline-strong)',
        padding: '8px 16px',
        textAlign: 'center',
        fontFamily: 'var(--sans)',
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--ink-700)',
        flexShrink: 0,
      }}
    >
      Offline — changes will sync when you reconnect
    </div>
  )
}
