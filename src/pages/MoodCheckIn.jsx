import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useBreakpoint } from '../hooks/useBreakpoint'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

const MOODS = [
  { name: 'tender',   color: '#E8C4B0', dot: '#D8A892', adj: 'soft, open, a little raw' },
  { name: 'calm',     color: '#DCDDC7', dot: '#9CA888', adj: 'settled, gentle, present' },
  { name: 'warm',     color: '#EDD3BD', dot: '#B8896C', adj: 'glad, comfortable, lit' },
  { name: 'hopeful',  color: '#E5D2A8', dot: '#C9B080', adj: 'forward-tilted, light' },
  { name: 'restless', color: '#D9B895', dot: '#B89678', adj: 'jangly, in-between' },
  { name: 'heavy',    color: '#C9B8A8', dot: '#8B7E6E', adj: 'tired, slow, weighted' },
]

function timeLabel() {
  const h = new Date().getHours()
  return h < 12 ? 'This morning' : h < 17 ? 'This afternoon' : 'Tonight'
}

function useMoodNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo || '/new'
  // Preserve any draft title/body the caller passed in state
  const draft = { title: location.state?.title, body: location.state?.body }

  const go = (mood, note) => {
    navigate(returnTo, {
      state: { mood: mood || undefined, moodNote: note || undefined, ...draft },
    })
  }
  return go
}

// ── Desktop / iPad landscape — card panel ─────────────────────────────────────
function DesktopMoodPanel() {
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const go = useMoodNav()

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-paper)', padding: '48px 24px', overflow: 'auto',
    }}>
      <div style={{
        width: '100%', maxWidth: 680, background: 'var(--bg-cream)',
        borderRadius: 20, padding: '48px 56px',
        boxShadow: '0 4px 32px rgba(58,51,43,0.08), 0 0 0 1px var(--hairline)',
      }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700 }}>
          Before you begin
        </div>
        <h2 style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, color: 'var(--ink-900)', letterSpacing: '-0.015em', margin: '10px 0 8px' }}>
          How are you arriving
          <em style={{ fontStyle: 'italic', color: 'var(--terra-300)'}}> here?</em>
        </h2>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-500)' }}>
          One word. It can change tomorrow.
        </div>

        {/* 3×2 rectangular mood grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 28 }}>
          {MOODS.map(m => {
            const sel = selected === m.name
            return (
              <button
                key={m.name}
                onClick={() => setSelected(m.name)}
                style={{
                  padding: '18px 20px', borderRadius: 14, textAlign: 'left',
                  background: sel ? m.color : 'var(--bg-paper)',
                  border: sel ? `2px solid ${m.dot}` : '2px solid transparent',
                  cursor: 'pointer', transition: 'background 0.15s, border 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: m.dot, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 19, fontWeight: 500, color: 'var(--ink-900)' }}>{m.name}</span>
                </div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', marginTop: 6, lineHeight: 1.5 }}>{m.adj}</div>
              </button>
            )
          })}
        </div>

        {/* Optional word */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: 1.6, color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            One word for today (optional)
          </div>
          <div style={{ padding: '14px 16px', background: 'var(--bg-paper)', borderRadius: 12, border: '1px solid var(--hairline)' }}>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="gentle, slow, golden…"
              style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-900)' }}
            />
          </div>
        </div>

        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => go(selected, note)}
            style={{
              padding: '11px 24px', background: 'var(--ink-900)', color: 'var(--bg-paper)',
              borderRadius: 999, fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600,
              border: 'none', cursor: 'pointer',
            }}
          >Begin writing</button>
          <button
            onClick={() => go(null, null)}
            style={{ background: 'none', border: 'none', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-500)', cursor: 'pointer' }}
          >skip the check-in</button>
        </div>
      </div>
    </div>
  )
}

// ── Mobile / iPad portrait — full-screen circles ───────────────────────────────
function MobileMoodScreen() {
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')
  const go = useMoodNav()
  const { isTabletPortrait: t } = useBreakpoint()

  const circleSize = t ? 110 : 78

  return (
    <div style={{
      flex: 1, minHeight: '100%',
      background: 'var(--terra-50)',
      display: 'flex', flexDirection: 'column', overflowY: 'auto',
    }}>
      <StatusBar />

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: t ? '32px 48px 0' : '46px 24px 0' }}>
        <button
          onClick={() => go(null, null)}
          style={{ background: 'transparent', border: 'none', fontFamily: 'var(--sans)', fontSize: t ? 17 : 14, color: 'var(--ink-500)', fontWeight: 500, cursor: 'pointer', padding: 0 }}
        >Skip</button>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ width: t ? 24 : 18, height: t ? 4 : 3, borderRadius: 2, background: i === 1 ? 'var(--ink-900)' : 'var(--hairline-strong)' }} />
          ))}
        </div>
        <button
          onClick={() => go(selected, note)}
          style={{ background: 'transparent', border: 'none', fontFamily: 'var(--sans)', fontSize: t ? 17 : 14, color: 'var(--ink-900)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
        >Next</button>
      </div>

      {/* Heading */}
      <div style={{ padding: t ? '64px 56px 0' : '70px 32px 0' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 13 : 12, letterSpacing: 2, color: 'var(--terra-400)', textTransform: 'uppercase', fontWeight: 700 }}>
          {timeLabel()}
        </div>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: t ? 52 : 38, fontWeight: 400, lineHeight: 1.1, letterSpacing: -0.6, margin: '12px 0 0', color: 'var(--ink-900)' }}>
          How would you<br />describe today<span style={{ color: 'var(--terra-300)' }}>?</span>
        </h1>
        <p style={{ fontFamily: 'var(--serif)', fontSize: t ? 20 : 16, fontStyle: 'italic', color: 'var(--ink-500)', marginTop: 12 }}>
          Pick one. There's no wrong answer.
        </p>
      </div>

      {/* Mood circles */}
      <div style={{
        padding: t ? '56px 56px 0' : '50px 32px 0',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: t ? 28 : 20,
        justifyItems: 'center',
      }}>
        {MOODS.map(mood => {
          const isSelected = selected === mood.name
          return (
            <button
              key={mood.name}
              onClick={() => setSelected(mood.name)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: t ? 14 : 10, padding: 0 }}
            >
              <div style={{
                width: circleSize, height: circleSize, borderRadius: circleSize / 2,
                background: mood.color,
                border: isSelected ? `3px solid var(--ink-900)` : 'none',
                boxShadow: isSelected
                  ? '0 0 0 5px var(--terra-50), 0 8px 20px rgba(58,51,43,0.12)'
                  : '0 4px 12px rgba(58,51,43,0.06)',
                position: 'relative', transition: 'box-shadow 0.15s, border 0.15s',
              }}>
                {isSelected && (
                  <div style={{
                    position: 'absolute', bottom: -3, right: -3,
                    width: t ? 30 : 22, height: t ? 30 : 22, borderRadius: t ? 15 : 11,
                    background: 'var(--ink-900)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#FAF5EC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              <div style={{ fontFamily: 'var(--serif)', fontSize: t ? 20 : 15, fontWeight: isSelected ? 600 : 400, color: 'var(--ink-900)' }}>
                {mood.name}
              </div>
            </button>
          )
        })}
      </div>

      {/* Optional word */}
      <div style={{ padding: t ? '52px 56px 0' : '48px 32px 0' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 13 : 11, letterSpacing: 1.6, color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
          One word for today (optional)
        </div>
        <div style={{ padding: '14px 16px', background: 'var(--bg-paper)', borderRadius: 14 }}>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="gentle, slow, golden…"
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: t ? 19 : 16, color: 'var(--ink-900)' }}
          />
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: t ? '40px 56px 56px' : '32px 24px 48px' }}>
        <button
          onClick={() => go(selected, note)}
          style={{
            width: '100%', padding: t ? '20px' : '16px',
            background: 'var(--ink-900)', color: 'var(--bg-paper)',
            border: 'none', borderRadius: 18,
            fontFamily: 'var(--sans)', fontSize: t ? 18 : 15, fontWeight: 600, cursor: 'pointer',
          }}
        >Continue to writing</button>
      </div>

      <HomeIndicator />
    </div>
  )
}

export default function MoodCheckIn() {
  const bp = useBreakpoint()
  if (bp.showEntriesPanel) return <DesktopMoodPanel />
  return <MobileMoodScreen />
}
