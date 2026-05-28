import { useRegisterSW } from 'virtual:pwa-register/react'

export default function UpdateBanner() {
  const { needRefresh: [needRefresh], updateServiceWorker } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div style={{
      background: 'var(--ink-900)',
      padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: 0, gap: 16,
    }}>
      <span style={{
        fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 500,
        color: 'rgba(250,245,236,0.8)',
      }}>
        A new version of Solace is ready.
      </span>
      <button
        onClick={() => updateServiceWorker(true)}
        style={{
          padding: '6px 14px', borderRadius: 999,
          background: 'var(--terra-300)', color: 'var(--bg-paper)',
          fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
          border: 'none', cursor: 'pointer', flexShrink: 0,
        }}
      >
        Restart
      </button>
    </div>
  )
}
