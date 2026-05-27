import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { hasKey } from '../store/cryptoStore'
import { useBreakpoint } from '../hooks/useBreakpoint'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import { SolaceLogo, SolaceLogoInline } from '../components/SolaceLogo'
import SolaceMark from '../components/SolaceLogo'

function useRedirectIfLoggedIn() {
  const navigate = useNavigate()
  const { user, loading } = useAuth()
  useEffect(() => {
    if (!loading && user) {
      navigate(hasKey() ? '/home' : '/phrase', { replace: true })
    }
  }, [user, loading, navigate])
  return loading
}

// ── Desktop landing (≥ 1024px) ────────────────────────────────────────────────
function DesktopLanding() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-paper)',
      display: 'flex', flexDirection: 'column', fontFamily: 'var(--sans)',
    }}>
      {/* Top nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', padding: '20px 56px', gap: 8, flexShrink: 0,
      }}>
        <SolaceLogoInline size={18} />
        <div style={{ flex: 1 }} />
        <button
          onClick={() => navigate('/login')}
          style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: 'var(--ink-900)', background: 'none', border: 'none', cursor: 'pointer' }}
        >Sign in</button>
        <button
          onClick={() => navigate('/signup')}
          style={{ padding: '9px 18px', borderRadius: 999, background: 'var(--ink-900)', color: 'var(--bg-paper)', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
        >Begin journaling</button>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, padding: '60px 56px 80px', display: 'flex', gap: 80, alignItems: 'center', maxWidth: 1360, margin: '0 auto', width: '100%' }}>
        {/* Left copy */}
        <div style={{ flex: '1.1', minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700 }}>
            Write daily · remember gently
          </div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(60px, 6.5vw, 92px)', fontWeight: 400,
            lineHeight: 0.98, letterSpacing: '-0.035em', color: 'var(--ink-900)', margin: '20px 0 22px',
          }}>
            Somewhere quiet<br />
            <em style={{ fontStyle: 'italic', color: 'var(--terra-300)' }}>to put the day down.</em>
          </h1>
          <p style={{
            fontFamily: 'var(--serif)', fontSize: 21, lineHeight: 1.55, color: 'var(--ink-700)',
            maxWidth: 520, margin: '0 0 32px',
          }}>
            Five minutes. One prompt. Nobody watching. Solace is a journaling app that asks nothing of you except that you arrive — and remembers, gently, that you did.
          </p>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <button
              onClick={() => navigate('/signup')}
              style={{ padding: '14px 26px', borderRadius: 999, background: 'var(--ink-900)', color: 'var(--bg-paper)', fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, border: 'none', cursor: 'pointer' }}
            >Begin your first entry</button>
            <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-500)' }}>
              Free to start · no card
            </span>
          </div>
          <div style={{
            marginTop: 52, display: 'flex', gap: 28,
            fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-300)',
            letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, flexWrap: 'wrap',
          }}>
            <span>End-to-end encrypted</span>
            <span style={{ color: 'var(--hairline-strong)' }}>·</span>
            <span>Works offline</span>
            <span style={{ color: 'var(--hairline-strong)' }}>·</span>
            <span>Open export</span>
          </div>
        </div>

        {/* Right — product peek */}
        <div style={{ flex: 1, minWidth: 0, position: 'relative', height: 460, flexShrink: 0 }}>
          {/* Tilted window mockup */}
          <div style={{
            position: 'absolute', top: 20, right: -20, width: 'min(520px, 48vw)', height: 400,
            borderRadius: 14, overflow: 'hidden', background: 'var(--bg-cream)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(0,0,0,0.04)',
            transform: 'rotate(2deg)',
          }}>
            {/* Window chrome */}
            <div style={{ height: 28, background: 'var(--bg-warm)', borderBottom: '1px solid var(--hairline)', display: 'flex', alignItems: 'center', padding: '0 12px', gap: 6 }}>
              <div style={{ width: 9, height: 9, borderRadius: 5, background: '#FF5F57' }} />
              <div style={{ width: 9, height: 9, borderRadius: 5, background: '#FEBC2E' }} />
              <div style={{ width: 9, height: 9, borderRadius: 5, background: '#28C840' }} />
            </div>
            <div style={{ padding: '24px 28px' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700 }}>
                Wed · 7 May
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, color: 'var(--ink-900)', letterSpacing: '-0.015em', margin: '10px 0 14px' }}>
                Long walk by the canal
              </div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.65, margin: 0 }}>
                Took the long way home through the park. The light was that particular kind of gold you only get in early evening, when everything seems to slow down. I sat on the bench near the willow and watched a heron stand absolutely still in the shallows.
              </p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: 13, color: 'var(--ink-700)', lineHeight: 1.65, margin: '12px 0 0' }}>
                It made me think about{' '}
                <span style={{ background: 'var(--terra-50)', padding: '0 3px', borderRadius: 2 }}>patience</span>
                {' '}— the kind that isn't waiting for anything,
              </p>
            </div>
          </div>

          {/* Tilted prompt card */}
          <div style={{
            position: 'absolute', bottom: 10, left: 0, width: 230, height: 210,
            borderRadius: 14, background: 'var(--terra-200)', padding: '20px 22px',
            boxShadow: '0 18px 40px rgba(139,115,85,0.28)',
            transform: 'rotate(-3deg)',
          }}>
            <SolaceMark size={48} sun="var(--bg-paper)" line="rgba(58,51,43,0.4)" />
            <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', fontWeight: 700, marginTop: 22, color: 'rgba(250,245,236,0.8)' }}>
              Today's prompt
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.25, fontStyle: 'italic', fontWeight: 400, marginTop: 8, color: 'var(--bg-paper)' }}>
              "What softened you this week?"
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── iPad portrait onboarding (768–1023px) ─────────────────────────────────────
function TabletPortraitOnboarding() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100dvh', background: 'var(--bg-paper)',
      position: 'relative', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Decorative blobs — scale with viewport */}
      <div style={{ position: 'absolute', top: 80, right: -140, width: 'clamp(380px, 44vw, 580px)', height: 'clamp(380px, 44vw, 580px)', borderRadius: '50%', background: 'var(--terra-50)', zIndex: 0, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 520, left: -100, width: 'clamp(260px, 32vw, 420px)', height: 'clamp(260px, 32vw, 420px)', borderRadius: '50%', background: 'var(--sage-100)', zIndex: 0, pointerEvents: 'none' }} />

      <div style={{
        position: 'relative', zIndex: 1, flex: 1,
        padding: 'clamp(100px, 12vh, 160px) clamp(56px, 9vw, 120px) clamp(60px, 7vh, 100px)',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        maxWidth: 920, margin: '0 auto', width: '100%',
      }}>
        <div>
          <SolaceLogo size={140} />
          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 'clamp(72px, 8.5vw, 108px)', fontWeight: 400, lineHeight: 1.02,
            letterSpacing: '-0.03em', margin: 'clamp(48px, 6vw, 80px) 0 0', color: 'var(--ink-900)',
          }}>
            A quiet place<br />for your{' '}
            <em style={{ fontStyle: 'italic', color: 'var(--terra-300)' }}>thinking.</em>
          </h1>
          <p style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(18px, 2.2vw, 26px)',
            color: 'var(--ink-500)', lineHeight: 1.5, marginTop: 'clamp(24px, 3vw, 40px)', maxWidth: 560,
          }}>
            Five minutes. One prompt. Nobody watching. Just you and the page.
          </p>
        </div>

        <div style={{ maxWidth: 560 }}>
          <button
            onClick={() => navigate('/signup')}
            style={{
              width: '100%', padding: 'clamp(16px, 1.8vw, 22px)', background: 'var(--ink-900)', color: 'var(--bg-paper)',
              borderRadius: 999, fontFamily: 'var(--sans)', fontSize: 'clamp(15px, 1.6vw, 18px)', fontWeight: 600,
              border: 'none', cursor: 'pointer', textAlign: 'center', display: 'block',
            }}
          >Begin your first entry</button>
          <button
            onClick={() => navigate('/login')}
            style={{
              width: '100%', padding: 'clamp(12px, 1.4vw, 16px)', textAlign: 'center', background: 'none',
              fontFamily: 'var(--sans)', fontSize: 'clamp(14px, 1.5vw, 17px)', color: 'var(--ink-700)', fontWeight: 500,
              border: 'none', cursor: 'pointer', display: 'block', marginTop: 4,
            }}
          >I already have an account</button>
        </div>
      </div>
    </div>
  )
}

// ── Mobile splash (< 768px) ───────────────────────────────────────────────────
function MobileWelcome() {
  const navigate = useNavigate()

  return (
    <div style={{ flex: 1, background: 'var(--bg-paper)', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      {/* Decorative blobs */}
      <div style={{ position: 'absolute', top: 90, right: -60, width: 220, height: 220, borderRadius: '50%', background: 'var(--terra-50)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 240, left: -40, width: 140, height: 140, borderRadius: '50%', background: 'var(--sage-100)', zIndex: 1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 380, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'var(--terra-100)', opacity: 0.7, zIndex: 1, pointerEvents: 'none' }} />

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '120px 32px 48px', zIndex: 5 }}>
        <div>
          <SolaceLogo size={72} />
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 48, fontWeight: 400, lineHeight: 1.05, letterSpacing: -1.2, margin: '40px 0 0', color: 'var(--ink-900)' }}>
            A quiet place<br />for your<br />
            <em style={{ fontStyle: 'italic', color: 'var(--terra-300)' }}>thinking.</em>
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontSize: 17, fontStyle: 'italic', color: 'var(--ink-500)', lineHeight: 1.5, marginTop: 22, maxWidth: 280 }}>
            Five minutes. One prompt. Nobody watching. Just you and the page.
          </p>
        </div>

        <div>
          <button
            onClick={() => navigate('/signup')}
            style={{ width: '100%', padding: '17px', background: 'var(--ink-900)', color: 'var(--bg-paper)', border: 'none', borderRadius: 999, fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, marginBottom: 12, cursor: 'pointer' }}
          >Begin your first entry</button>
          <button
            onClick={() => navigate('/login')}
            style={{ width: '100%', padding: '13px', background: 'transparent', color: 'var(--ink-700)', border: 'none', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
          >I already have an account</button>
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function Welcome() {
  const loading = useRedirectIfLoggedIn()
  const bp = useBreakpoint()

  if (loading) return null

  if (bp.isDesktop) return <DesktopLanding />
  if (!bp.isMobile) return <TabletPortraitOnboarding />
  return <MobileWelcome />
}
