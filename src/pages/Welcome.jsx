import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasKey } from '../store/cryptoStore'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import { SolaceLogo } from '../components/SolaceLogo'

export default function Welcome() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      if (hasKey()) {
        navigate('/home', { replace: true })
      } else {
        navigate('/phrase', { replace: true })
      }
    }
  }, [user, loading, navigate])

  if (loading) return null

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--bg-paper)',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusBar />

      {/* Decorative blobs */}
      <div
        style={{
          position: 'absolute',
          top: 90,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'var(--terra-50)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 240,
          left: -40,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'var(--sage-100)',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 380,
          right: 60,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'var(--terra-100)',
          opacity: 0.7,
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '120px 32px 48px',
          zIndex: 5,
        }}
      >
        <div>
          {/* Logo */}
          <SolaceLogo size={72} />

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 48,
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: -1.2,
              margin: '40px 0 0',
              color: 'var(--ink-900)',
            }}
          >
            A quiet place
            <br />
            for your
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--terra-300)' }}>
              thinking.
            </em>
          </h1>

          {/* Subtext */}
          <p
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 17,
              fontStyle: 'italic',
              color: 'var(--ink-500)',
              lineHeight: 1.5,
              marginTop: 22,
              maxWidth: 280,
            }}
          >
            Five minutes. One prompt. Nobody watching. Just you and the page.
          </p>
        </div>

        {/* CTA buttons */}
        <div>
          <button
            onClick={() => navigate('/signup')}
            style={{
              width: '100%',
              padding: '17px',
              background: 'var(--ink-900)',
              color: 'var(--bg-paper)',
              border: 'none',
              borderRadius: 999,
              fontFamily: 'var(--sans)',
              fontSize: 15,
              fontWeight: 600,
              marginBottom: 12,
              cursor: 'pointer',
            }}
          >
            Begin your first entry
          </button>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%',
              padding: '13px',
              background: 'transparent',
              color: 'var(--ink-700)',
              border: 'none',
              fontFamily: 'var(--sans)',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            I already have an account
          </button>
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}
