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
import { SolaceLogoInline } from '../components/SolaceLogo'
import { getDailyPrompt, getPromptForDate, hasTodayEntry } from '../data/prompts'
import UpdateBanner from '../components/UpdateBanner'

const MOOD_COLORS = {
  calm: '#9CA888',
  tender: '#D8A892',
  restless: '#B89678',
  warm: '#B8896C',
  hopeful: '#C9B080',
  heavy: '#8B7E6E',
}

// ── Daily prompt card ─────────────────────────────────────────────────────────
function PromptCard({ onWrite, onSkip, size = 'mobile' }) {
  const prompt = getDailyPrompt()
  const t = size === 'tablet'
  const d = size === 'desktop'

  return (
    <div style={{
      background: 'var(--terra-50)', borderRadius: t ? 18 : d ? 18 : 18,
      padding: t ? '26px 28px' : d ? '26px 28px' : '20px 22px',
      position: 'relative',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: t ? 12 : 10,
      }}>
        <div style={{
          fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em',
          textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700,
        }}>
          Today's prompt
        </div>
      </div>
      <div style={{
        fontFamily: 'var(--serif)', fontWeight: 400,
        fontSize: t ? 28 : d ? 22 : 22, lineHeight: 1.25,
        color: 'var(--ink-900)', margin: t ? '0 0 22px' : '0 0 16px',
      }}>
        {prompt}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={onWrite}
          style={{
            padding: t ? '10px 18px' : '9px 16px', borderRadius: 999,
            background: 'var(--terra-300)', color: 'var(--bg-paper)',
            fontFamily: 'var(--sans)', fontSize: t ? 13 : 13, fontWeight: 600,
            border: 'none', cursor: 'pointer',
          }}
        >Begin writing</button>
        {onSkip && (
          <button
            onClick={onSkip}
            style={{
              background: 'transparent', border: 'none', padding: '9px 12px',
              fontFamily: 'var(--sans)', fontSize: t ? 13 : 13, fontWeight: 500,
              color: 'var(--ink-700)', cursor: 'pointer',
            }}
          >Skip</button>
        )}
      </div>
    </div>
  )
}

function computeStreak(entries) {
  if (!entries.length) return 0
  const days = new Set(entries.map(e => {
    const d = new Date(e.client_updated_at || e.created_at)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
  }))
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today); d.setDate(today.getDate() - i)
    if (days.has(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`)) streak++
    else if (i > 0) break
  }
  return streak
}

// ── Desktop / iPad landscape right-pane placeholder ──────────────────────────
function DesktopHomePlaceholder() {
  const navigate = useNavigate()
  const { entries } = useEntries()
  const promptEnabled = localStorage.getItem('solace_daily_prompt') !== 'false'

  const now = new Date()
  const wd = now.toLocaleString('en', { weekday: 'long' })
  const day = now.getDate()
  const month = now.toLocaleString('en', { month: 'long' })
  const hour = now.getHours()
  const timeLabel = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const streak = computeStreak(entries)
  const prompt = getDailyPrompt()

  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`
  // todayEntry = today's entry that was written in response to the prompt
  const todayEntry = entries.find(e => {
    const d = new Date(e.client_updated_at || e.created_at)
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}` === todayKey && e.prompt
  })
  const answered = !!todayEntry

  if (promptEnabled) {
    const recentDays = Array.from({ length: 5 }, (_, i) => {
      const d = new Date(now); d.setDate(now.getDate() - (i + 1))
      const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      const entry = entries.find(e => {
        const ed = new Date(e.client_updated_at || e.created_at)
        return `${ed.getFullYear()}-${ed.getMonth()}-${ed.getDate()}` === dKey
      })
      if (!entry) return null
      return {
        label: d.toLocaleString('en', { weekday: 'short' }) + ' · ' + d.getDate() + ' ' + d.toLocaleString('en', { month: 'short' }),
        promptText: getPromptForDate(d),
        entryId: entry.id,
      }
    }).filter(Boolean)

    return (
      <div style={{ flex: 1, height: '100%', background: 'var(--bg-paper)', overflow: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: '50%', background: 'var(--terra-50)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, left: 60, width: 220, height: 220, borderRadius: '50%', background: 'var(--sage-100)', opacity: 0.6, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', padding: '64px 64px 80px' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700 }}>
            {wd} · {day} {month} · {timeLabel}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-500)', marginTop: 8 }}>
            Today's prompt{streak > 1 ? ` — ${streak} day streak` : ''}
          </div>

          <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(40px, 4.5vw, 64px)', lineHeight: 1.05, letterSpacing: '-0.025em', color: 'var(--ink-900)', margin: '36px 0 22px', maxWidth: 620 }}>
            {prompt}
          </h1>

          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--ink-500)', lineHeight: 1.55, maxWidth: 540 }}>
            Five minutes. No audience. Begin anywhere — the first sentence is just to find the second.
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 36 }}>
            {answered ? (
              <>
                <button
                  onClick={() => navigate('/new')}
                  style={{ padding: '13px 28px', borderRadius: 999, background: 'var(--ink-900)', color: 'var(--bg-paper)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >Write freely</button>
                <button
                  onClick={() => navigate(`/entry/${todayEntry.id}`)}
                  style={{ padding: '13px 22px', borderRadius: 999, background: 'transparent', border: '1px solid var(--hairline-strong)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink-700)', cursor: 'pointer' }}
                >View entry</button>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--terra-400)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, marginLeft: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--terra-300)' }} /> written today
                </span>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/new', { state: { showPrompt: true, promptText: prompt } })}
                  style={{ padding: '13px 28px', borderRadius: 999, background: 'var(--ink-900)', color: 'var(--bg-paper)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                >Begin writing</button>
                <button
                  onClick={() => navigate('/new')}
                  style={{ padding: '13px 22px', borderRadius: 999, background: 'transparent', border: '1px solid var(--hairline-strong)', fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, color: 'var(--ink-700)', cursor: 'pointer' }}
                >Skip — write freely</button>
                <span style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, marginLeft: 8 }}>
                  <kbd style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(58,51,43,0.05)', fontFamily: 'var(--sans)', fontStyle: 'normal' }}>↵</kbd> begin
                </span>
              </>
            )}
          </div>

          {recentDays.length > 0 && (
            <div style={{ marginTop: 64, paddingTop: 28, borderTop: '1px solid var(--hairline)' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 14 }}>
                Recent prompts
              </div>
              {recentDays.map((row, i) => (
                <div
                  key={i}
                  onClick={() => navigate(`/entry/${row.entryId}`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--hairline)', cursor: 'pointer' }}
                >
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, width: 100, flexShrink: 0 }}>{row.label}</span>
                  <span style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-700)', flex: 1, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{row.promptText}</span>
                  <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--terra-400)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                    <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--terra-300)' }} /> answered
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Prompt disabled — plain placeholder
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-paper)', flexDirection: 'column', gap: 20, padding: 48, overflow: 'auto' }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 36, fontWeight: 400, color: 'var(--ink-900)', letterSpacing: '-0.02em', marginBottom: 12, lineHeight: 1.15 }}>
          {entries.length === 0 ? 'Your journal is empty.' : 'Select an entry,\nor write a new one.'}
        </div>
        <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-500)', lineHeight: 1.6, marginBottom: 32 }}>
          {entries.length === 0
            ? 'A quiet place for your thinking.\nFive minutes. One page. Just you.'
            : 'Choose from the list on the left, or start something new.'}
        </p>
        <button
          onClick={() => navigate('/new')}
          style={{ padding: '14px 32px', background: 'var(--ink-900)', color: 'var(--bg-paper)', border: 'none', borderRadius: 999, fontFamily: 'var(--sans)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}
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
  const promptEnabled = localStorage.getItem('solace_daily_prompt') !== 'false'

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
          fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 'clamp(52px, 7.5vw, 84px)', lineHeight: 1.08,
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

      {/* Two-up: prompt + write now */}
      <div style={{
        padding: '36px 56px 0',
        display: 'grid', gridTemplateColumns: promptEnabled ? '1.2fr 1fr' : '1fr', gap: 16,
      }}>
        {/* Prompt card */}
        {promptEnabled && <PromptCard size="tablet" onWrite={() => navigate('/new', { state: { showPrompt: true, promptText: getDailyPrompt() } })} />}

        {/* Dark CTA card */}
        <div
          onClick={() => navigate('/new')}
          style={{
            padding: '26px 28px', borderRadius: 18, background: 'var(--ink-900)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{
            fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: 'rgba(250,245,236,0.6)', fontWeight: 700,
          }}>Write now</div>
          <div style={{
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(20px, 3vw, 34px)',
            lineHeight: 1.2, fontWeight: 400, color: 'var(--bg-paper)',
            margin: '12px 0 24px', flex: 1,
          }}>
            A blank page,<br />waiting.
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 20, background: 'rgba(250,245,236,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 14L13 4M13 4H7M13 4v6" stroke="var(--bg-paper)" strokeWidth="1.6" strokeLinecap="round" />
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
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(26px, 4vw, 48px)', fontWeight: 400, lineHeight: 1, color: 'var(--ink-900)' }}>{day}</div>
                    <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.14em', color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 600, marginTop: 4 }}>{month}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 3 }}>
                      {moodColor && <span style={{ width: 6, height: 6, borderRadius: 3, background: moodColor }} />}
                      <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--ink-500)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
                        {entry.mood ? `${entry.mood} · ` : ''}{entry.wordCount || 0} words
                      </span>
                    </div>
                    <div style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(16px, 2.4vw, 26px)', fontWeight: 500, color: 'var(--ink-900)', lineHeight: 1.25, marginBottom: 4 }}>
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

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
}

// ── Mobile home (< 768px) ─────────────────────────────────────────────────────
function MobileHome() {
  const navigate = useNavigate()
  const { entries, loading } = useEntries()
  const { syncing, pendingCount } = useSync()
  const { user } = useAuth()
  const [promptSkipped, setPromptSkipped] = useState(false)
  const promptEnabled = localStorage.getItem('solace_daily_prompt') !== 'false'

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'quietly.' : hour < 17 ? 'gently.' : 'softly.'
  const monthName = now.toLocaleString('en', { month: 'long' })
  const weekNum = getWeekNumber(now)
  const avatarLetter = (user?.email?.[0] || 'y').toUpperCase()

  return (
    <div style={{ flex: 1, background: 'var(--bg-paper)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <UpdateBanner />
      <OfflineBanner />

      {/* Header */}
      <div style={{ padding: '42px 28px 0', flexShrink: 0 }}>
        {/* Logo row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <SolaceLogoInline size={18} sun="var(--terra-200)" line="var(--ink-900)" wordColor="var(--ink-900)" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => navigate('/calendar')}
              style={{
                width: 36, height: 36, borderRadius: 18, background: 'var(--terra-50)',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1.5" y="2.5" width="13" height="12" rx="2" stroke="var(--terra-400)" strokeWidth="1.4"/>
                <path d="M1.5 6h13" stroke="var(--terra-400)" strokeWidth="1.4"/>
                <path d="M5 1v3M11 1v3" stroke="var(--terra-400)" strokeWidth="1.4" strokeLinecap="round"/>
                <rect x="4" y="9" width="2" height="2" rx="0.5" fill="var(--terra-400)"/>
                <rect x="7" y="9" width="2" height="2" rx="0.5" fill="var(--terra-400)"/>
                <rect x="10" y="9" width="2" height="2" rx="0.5" fill="var(--terra-400)"/>
              </svg>
            </button>
            <div
              onClick={() => navigate('/settings')}
              style={{
                width: 36, height: 36, borderRadius: 18, background: 'var(--terra-50)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
                color: 'var(--terra-400)', cursor: 'pointer',
              }}
            >{avatarLetter}</div>
          </div>
        </div>

        {/* Date label */}
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: 2.4, color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 600 }}>
          {monthName} · Week {weekNum}
        </div>

        {/* Greeting */}
        <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 44, lineHeight: 1.05, letterSpacing: -1, margin: '14px 0 8px', color: 'var(--ink-900)' }}>
          Today,{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--terra-300)' }}>{greeting}</em>
        </h1>

        {/* Streak / count */}
        <div style={{ fontFamily: 'var(--serif)', fontSize: 16, color: 'var(--ink-700)', fontStyle: 'italic', lineHeight: 1.5, minHeight: 24 }}>
          {syncing ? 'syncing…' : pendingCount > 0 ? `${pendingCount} pending` : entries.length > 0 ? `${entries.length} ${entries.length === 1 ? 'entry' : 'entries'} so far.` : ''}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="page-scroll" style={{ flex: 1, paddingBottom: 100 }}>
        {/* Prompt card */}
        {promptEnabled && !promptSkipped && (
          <div style={{ margin: '28px 20px 0' }}>
            <PromptCard
              size="mobile"
              onWrite={() => navigate('/new', { state: { showPrompt: true, promptText: getDailyPrompt() } })}
              onSkip={() => setPromptSkipped(true)}
            />
          </div>
        )}

        {loading ? (
          <div style={{ padding: '60px 28px', textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-500)', fontSize: 16 }}>
            Loading your journal…
          </div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '40px 28px', textAlign: 'center' }}>
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
          <>
            {/* Section header */}
            <div style={{ padding: '34px 28px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink-900)' }}>Recent entries</div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--terra-400)', fontWeight: 600 }}>All</div>
            </div>
            <div style={{ padding: '0 28px' }}>
              {entries.map((entry, i) => (
                <EntryCard key={entry.id} entry={entry} variant="list" first={i === 0} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/new')}
        style={{
          position: 'fixed', right: 24, bottom: 36, width: 60, height: 60,
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
