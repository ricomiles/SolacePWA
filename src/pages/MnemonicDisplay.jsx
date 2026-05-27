import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

export default function MnemonicDisplay() {
  const location = useLocation()
  const navigate = useNavigate()
  const mnemonic = location.state?.mnemonic || ''
  const words = mnemonic ? mnemonic.split(' ') : []
  const [copied, setCopied] = useState(false)

  if (!mnemonic) {
    navigate('/', { replace: true })
    return null
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mnemonic)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Clipboard not available — silently fail
    }
  }

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--bg-cream)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <StatusBar />

      <div style={{ padding: '46px 28px 80px', flex: 1 }}>
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 30,
            fontWeight: 400,
            letterSpacing: -0.5,
            margin: '0 0 8px',
            color: 'var(--ink-900)',
          }}
        >
          Your recovery phrase
        </h1>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 15,
            fontStyle: 'italic',
            color: 'var(--ink-700)',
            margin: '0 0 28px',
            lineHeight: 1.55,
          }}
        >
          These 12 words are the only way to access your journal on a new device.{' '}
          <strong style={{ fontStyle: 'normal', color: 'var(--terra-400)' }}>
            If you lose them, your entries cannot be recovered — by anyone.
          </strong>
        </p>

        {/* Warning box */}
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--terra-50)',
            borderRadius: 14,
            marginBottom: 28,
            border: '1px solid var(--terra-100)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 13,
              color: 'var(--terra-400)',
              margin: 0,
              fontWeight: 600,
            }}
          >
            Write these words on paper and store them somewhere safe.
            Do not screenshot this screen.
          </p>
        </div>

        {/* 3×4 word grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 24,
          }}
        >
          {words.map((word, idx) => (
            <div
              key={idx}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-paper)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                border: '1px solid var(--hairline)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--sans)',
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--ink-300)',
                  minWidth: 16,
                }}
              >
                {idx + 1}
              </span>
              <span
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 15,
                  color: 'var(--ink-900)',
                  fontWeight: 400,
                }}
              >
                {word}
              </span>
            </div>
          ))}
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          style={{
            width: '100%',
            padding: '14px',
            background: copied ? 'var(--sage-100)' : 'var(--bg-paper)',
            color: copied ? 'var(--ink-700)' : 'var(--ink-900)',
            border: '1px solid var(--hairline-strong)',
            borderRadius: 14,
            fontFamily: 'var(--sans)',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'all 0.2s',
          }}
        >
          {copied ? '✓ Copied to clipboard' : 'Copy to clipboard'}
        </button>

        {/* Continue button */}
        <button
          onClick={() => navigate('/verify', { state: { mnemonic } })}
          style={{
            width: '100%',
            padding: '16px',
            background: 'var(--ink-900)',
            color: 'var(--bg-paper)',
            border: 'none',
            borderRadius: 18,
            fontFamily: 'var(--sans)',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          I've saved my phrase
        </button>
      </div>

      <HomeIndicator />
    </div>
  )
}
