import { useState } from 'react'

const STORAGE_KEY = 'solace_install_banner_dismissed'

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
}

export default function IOSInstallBanner() {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === '1',
  )

  if (dismissed || !isIOS() || isStandalone()) return null

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1')
    setDismissed(true)
  }

  return (
    <div
      style={{
        background: 'var(--bg-paper)',
        borderTop: '1px solid var(--hairline)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--ink-900)',
            marginBottom: 2,
          }}
        >
          Add to Home Screen
        </div>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 12,
            color: 'var(--ink-500)',
          }}
        >
          Tap <strong>Share</strong> then <strong>"Add to Home Screen"</strong> to install
        </div>
      </div>
      <button
        onClick={handleDismiss}
        style={{
          background: 'transparent',
          border: 'none',
          fontFamily: 'var(--sans)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--ink-500)',
          cursor: 'pointer',
          padding: '4px 8px',
          flexShrink: 0,
        }}
      >
        ✕
      </button>
    </div>
  )
}
