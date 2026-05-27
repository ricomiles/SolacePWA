import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useEntries } from '../hooks/useEntries'
import { useSync } from '../hooks/useSync'
import { useAuth } from '../hooks/useAuth'
import { useBreakpoint } from '../hooks/useBreakpoint'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import TabBar from '../components/TabBar'
import EntryCard from '../components/EntryCard'
import OfflineBanner from '../components/OfflineBanner'
import IOSInstallBanner from '../components/IOSInstallBanner'

const MOOD_COLORS = {
  calm: '#9CA888',
  tender: '#D8A892',
  restless: '#B89678',
  warm: '#B8896C',
  hopeful: '#C9B080',
  heavy: '#8B7E6E',
}

const FILTERS = ['Days', 'Weeks', 'Months']

// ── Desktop / iPad landscape right-pane placeholder ──────────────────────────
function DesktopHomePlaceholder() {
  const navigate = useNavigate()
  const { entries } = useEntries()

  return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-paper)', flexDirection: 'column', gap: 20,
      padding: 48, overflow: 'auto',
    }}>
      <div style={{
        textAlign: 'center', maxWidth: 440,
      }}>
        <div style={{
          fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400,
          color: 'var(--ink-900)', letterSpacing: '-0.02em', marginBottom: 12,
          lineHeight: 1.15,
        }}>
          {entries.length === 0
            ? 'Your journal is empty.'
            : 'Select an entry,\nor write a new one.'}
        </div>
        <p style={{
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16,
          color: 'var(--ink-500)', lineHeight: 1.6, marginBottom: 32,
        }}>
          {entries.length === 0
            ? 'A quiet place for your thinking.\nFive minutes. One page. Just you.'
            : 'Choose from the list on the left, or start something new.'}
        </p>
        <button
          onClick={() => navigate('/new')}
          style={{
            padding: '14px 32px', background: 'var(--ink-900)', color: 'var(--bg-paper)',
            border: 'none', borderRadius: 999, fontFamily: 'var(--sans)',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 9.5L9 2l2.5 2.5-7.5 7.5H1.5v-2.5z" stroke="var(--bg-paper)" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
          </svg>
          Write today's entry
        </button>
      </div>
    </div>
  )
}

// ── iPad portrait home (768–1023px) ──────────────────────────────────────────
function TabletPortraitHome() {
  const navigate = useNavigate()
  const { entries } = useEntries()
  const { user } = useAuth()

  const now = new Date()
  const dayName = now.toLocaleString('en', { weekday: 'long' })
  const dateLabel = now.toLocaleString('en', { day: 'numeric', month: 'long' })
  const hour = now.getHours()
  const greeting = hour < 12 ? 'quietly.' : hour < 17 ? 'gently.' : 'softly.'

  return (
    <div style={{ background: 'var(--bg-paper)', minHeight: '100%' }}>
      {/* Greeting */}
      <div style={{ padding: '28px 56px 0' }}>
        <div style={{
          fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700,
        }}>{dayName} · {dateLabel}</div>
        <h1 style={{
          fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 56, lineHeight: 1.08,
          letterSpacing: '-0.025em', color: 'var(--ink-900)', margin: '12px 0 8px',
        }}>
          Today,{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--terra-300)' }}>{greeting}</em>
        </h1>
        {entries.length > 0 && (
          <div style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-500)',
          }}>
            {entries.length} {entries.length === 1 ? 'entry' : 'entries'} so far.
          </div>
        )}
      </div>

      {/* Two-up cards */}
      <div style={{
        padding: '28px 56px 0',
        display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 14,
      }}>
        {/* Write now card */}
        <div
          onClick={() => navigate('/new')}
          style={{
            padding: '24px 26px', borderRadius: 18, background: 'var(--terra-50)',
            cursor: 'pointer', position: 'relative',
          }}
        >
          <div style={{
            fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700,
          }}>Today</div>
          <div style={{
            fontFamily: 'var(--serif)', fontSize: 24, lineHeight: 1.25, fontWeight: 400,
            color: 'var(--ink-900)', margin: '10px 0 20px',
          }}>
            What would you like to write about?
          </div>
          <span style={{
            padding: '9px 16px', borderRadius: 999, background: 'var(--terra-300)',
            color: 'var(--bg-paper)', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
            display: 'inline-block',
          }}>Begin writing</span>
        </div>

        {/* Dark CTA card */}
        <div
          onClick={() => navigate('/new')}
          style={{
            padding: '24px 26px', borderRadius: 18, background: 'var(--ink-900)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{
            fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(250,245,236,0.6)', fontWeight: 700,
          }}>Write now</div>
          <div style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 22,
            lineHeight: 1.2, fontWeight: 400, color: 'var(--bg-paper)',
            margin: '10px 0 20px', flex: 1,
          }}>
            A blank page,<br />waiting.
          </div>
          <div style={{
            width: 38, height: 38, borderRadius: 19, background: 'rgba(250,245,236,0.14)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 14L12 4M12 4H6M12 4v6" stroke="var(--bg-paper)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Recent entries */}
      {entries.length > 0 && (
        <>
          <div style={{
            padding: '36px 56px 14px', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink-900)' }}>
              Recent entries
            </div>
            <button
              onClick={() => {}}
              style={{
                fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--terra-400)', fontWeight: 600,
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >All →</button>
          </div>

          <div style={{ padding: '0 56px 48px' }}>
            {entries.slice(0, 5).map((entry, i) => {
              const d = new Date(entry.client_updated_at || entry.created_at)
              const day = String(d.getDate()).padStart(2, '0')
              const month = d.toLocaleString('en', { month: 'short' }).toUpperCase()
              const moodColor = entry.mood ? (MOOD_COLORS[entry.mood] || 'var(--ink-300)') : null

              return (
                <div
                  key={entry.id}
                  onClick={() => navigate(`/entry/${entry.id}`)}
                  style={{
                    display: 'flex', gap: 22, padding: '18px 0',
                    borderBottom: '1px solid var(--hairline)', cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 52, flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 28, fontWeight: 400, lineHeight: 1, color: 'var(--ink-900)' }}>{day}</div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>{month}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 3 }}>
                      {moodColor && <span style={{ width: 6, height: 6, borderRadius: 3, background: moodColor }} />}
                      <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--ink-500)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                        {entry.mood ? `${entry.mood} · ` : ''}{entry.wordCount || 0} words
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500, color: 'var(--ink-900)', lineHeight: 1.25, marginBottom: 4 }}>
                      {entry.title || 'Untitled'}
                    </div>
                    {entry.body && (
                      <div style={{
                        fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-500)', lineHeight: 1.5,
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>{entry.body}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

// ── Mobile home (< 768px) ─────────────────────────────────────────────────────
function MobileHome() {
  const navigate = useNavigate()
  const { entries, loading } = useEntries()
  const { syncing, pendingCount } = useSync()
  const [activeFilter, setActiveFilter] = useState(0)

  const now = new Date()
  const monthName = now.toLocaleString('en', { month: 'long' })

  return (
    <div style={{ flex: 1, background: 'var(--bg-warm)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <OfflineBanner />

      {/* Header */}
      <div style={{
        padding: '42px 28px 18px', display: 'flex',
        justifyContent: 'space-between', alignItems: 'flex-end', flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-500)' }}>
            — the daybook —
          </div>
          <h1 style={{
            fontFamily: 'var(--serif)', fontSize: 38, fontWeight: 400,
            letterSpacing: -0.6, margin: '6px 0 0', lineHeight: 1, color: 'var(--ink-900)',
          }}>
            {monthName}<span style={{ color: 'var(--terra-300)' }}>.</span>
          </h1>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-500)', textAlign: 'right' }}>
          {syncing ? 'syncing…' : pendingCount > 0 ? `${pendingCount} pending` : ''}
        </div>
      </div>

      {/* Filter pills */}
      <div style={{ padding: '0 28px 8px', display: 'flex', gap: 6, flexShrink: 0 }}>
        {FILTERS.map((filter, i) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(i)}
            style={{
              padding: '6px 14px', borderRadius: 999, fontFamily: 'var(--sans)',
              fontSize: 12, fontWeight: 600,
              background: activeFilter === i ? 'var(--ink-900)' : 'transparent',
              color: activeFilter === i ? 'var(--bg-paper)' : 'var(--ink-500)',
              border: activeFilter === i ? 'none' : '1px solid var(--hairline-strong)',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >{filter}</button>
        ))}
      </div>

      {/* Timeline */}
      <div className="page-scroll" style={{ flex: 1, padding: '20px 28px 100px', position: 'relative' }}>
        {entries.length > 0 && (
          <div style={{
            position: 'absolute', left: 64, top: 28, bottom: 40, width: 1,
            background: 'var(--hairline-strong)', pointerEvents: 'none',
          }} />
        )}

        {loading ? (
          <div style={{ padding: '60px 0', textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-500)', fontSize: 16 }}>
            Loading your journal…
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400, color: 'var(--ink-900)', marginBottom: 12 }}>
              Your journal is empty.
            </div>
            <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-500)', marginBottom: 28 }}>
              Begin with today's entry.
            </p>
            <button
              onClick={() => navigate('/new')}
              style={{
                padding: '14px 28px', background: 'var(--ink-900)', color: 'var(--bg-paper)',
                border: 'none', borderRadius: 999, fontFamily: 'var(--sans)',
                fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >Write first entry</button>
          </div>
        ) : (
          entries.map(entry => <EntryCard key={entry.id} entry={entry} />)
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/new')}
        className="mobile-only"
        style={{
          position: 'fixed', right: 24, bottom: 100, width: 60, height: 60,
          borderRadius: 30, background: 'var(--ink-900)', color: 'var(--bg-paper)',
          border: 'none', boxShadow: '0 8px 24px rgba(58,51,43,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 40, cursor: 'pointer',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path d="M3 16.5L15.5 4l3.5 3.5L6.5 20H3v-3.5z" stroke="#FAF5EC" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        </svg>
      </button>

      <TabBar />
      <IOSInstallBanner />
      <HomeIndicator />
    </div>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function Home() {
  const bp = useBreakpoint()

  if (bp.showEntriesPanel) return <DesktopHomePlaceholder />
  if (bp.isTabletPortrait) return <TabletPortraitHome />
  return <MobileHome />
}
