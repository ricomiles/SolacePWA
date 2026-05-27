import { useState, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

export default function MnemonicVerify() {
  const location = useLocation()
  const navigate = useNavigate()
  const mnemonic = location.state?.mnemonic || ''
  const words = mnemonic ? mnemonic.split(' ') : []

  // Pick 3 random positions to verify
  const positions = useMemo(() => {
    if (words.length < 12) return [0, 1, 2]
    const indices = []
    while (indices.length < 3) {
      const n = Math.floor(Math.random() * 12)
      if (!indices.includes(n)) indices.push(n)
    }
    return indices.sort((a, b) => a - b)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const [answers, setAnswers] = useState({ [positions[0]]: '', [positions[1]]: '', [positions[2]]: '' })
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')

  if (!mnemonic) {
    navigate('/', { replace: true })
    return null
  }

  const handleVerify = () => {
    setError('')

    // Check answers
    for (const pos of positions) {
      if ((answers[pos] || '').trim().toLowerCase() !== words[pos].toLowerCase()) {
        setError(`Word ${pos + 1} is incorrect. Check your phrase and try again.`)
        return
      }
    }

    if (!agreed) {
      setError('Please confirm you understand your phrase cannot be recovered.')
      return
    }

    navigate('/home', { replace: true })
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
          Confirm your phrase
        </h1>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 15,
            fontStyle: 'italic',
            color: 'var(--ink-700)',
            margin: '0 0 36px',
            lineHeight: 1.55,
          }}
        >
          Enter the words at the positions shown to confirm you've saved your phrase.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
          {positions.map((pos) => (
            <div key={pos}>
              <label
                style={{
                  display: 'block',
                  fontFamily: 'var(--sans)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1.6,
                  textTransform: 'uppercase',
                  color: 'var(--terra-400)',
                  marginBottom: 8,
                }}
              >
                Word {pos + 1}
              </label>
              <input
                type="text"
                value={answers[pos] || ''}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [pos]: e.target.value }))
                }
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                placeholder={`Enter word ${pos + 1}`}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  background: 'var(--bg-paper)',
                  border: '1px solid var(--hairline-strong)',
                  borderRadius: 14,
                  fontFamily: 'var(--serif)',
                  fontSize: 17,
                  color: 'var(--ink-900)',
                  outline: 'none',
                }}
              />
            </div>
          ))}
        </div>

        {/* Agreement checkbox */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            cursor: 'pointer',
            marginBottom: 28,
          }}
        >
          <div
            onClick={() => setAgreed((a) => !a)}
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              border: agreed ? 'none' : '2px solid var(--ink-300)',
              background: agreed ? 'var(--ink-900)' : 'transparent',
              flexShrink: 0,
              marginTop: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {agreed && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="#FAF5EC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 13,
              color: 'var(--ink-700)',
              lineHeight: 1.5,
            }}
          >
            I understand my recovery phrase cannot be recovered if lost. Solace has no way to restore access to my entries.
          </span>
        </label>

        {error && (
          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 13,
              color: '#A04F3A',
              margin: '0 0 20px',
              padding: '10px 14px',
              background: '#FDF0EC',
              borderRadius: 10,
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleVerify}
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
          Confirm &amp; continue
        </button>
      </div>

      <HomeIndicator />
    </div>
  )
}
