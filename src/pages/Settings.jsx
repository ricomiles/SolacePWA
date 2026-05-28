import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { signOut } from '../services/auth'
import { clearKey } from '../store/cryptoStore'
import { useAuth } from '../hooks/useAuth'
import { useEntries } from '../hooks/useEntries'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useTheme, THEMES } from '../hooks/useTheme'
import { requestPermission, subscribeToPush, unsubscribeFromPush, updateReminderSettings, fetchSubscription, isSubscribed } from '../services/notifications'
import db from '../db'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

function Toggle({ checked, onChange, size = 'sm' }) {
  const w = size === 'lg' ? 52 : 40
  const h = size === 'lg' ? 30 : 24
  const knob = size === 'lg' ? 24 : 18
  const travel = w - h  // knob moves this many px
  return (
    <div
      onClick={e => { e.stopPropagation(); onChange(!checked) }}
      style={{
        width: w, height: h, borderRadius: h / 2,
        background: checked ? 'var(--terra-300)' : 'var(--hairline-strong)',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
        transition: 'background 0.2s',
      }}
    >
      <div style={{
        position: 'absolute',
        top: (h - knob) / 2, left: checked ? travel - (h - knob) / 2 + (h - knob) / 2 : (h - knob) / 2,
        width: knob, height: knob, borderRadius: knob / 2,
        background: 'var(--bg-paper)',
        boxShadow: '0 1px 3px rgba(58,51,43,0.18)',
        transition: 'left 0.2s',
      }} />
    </div>
  )
}

function Row({ icon, title, detail, last, danger, onClick, checked, onToggle, t }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center',
        minHeight: t ? 72 : 50,
        padding: t ? '0 28px' : '0 16px',
        position: 'relative',
        borderBottom: last ? 'none' : '1px solid var(--hairline)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {icon && (
        <div style={{
          width: t ? 44 : 28, height: t ? 44 : 28,
          borderRadius: t ? 12 : 8,
          background: icon.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginRight: t ? 18 : 12,
        }}>
          <span style={{ fontFamily: 'var(--serif)', fontSize: t ? 20 : 14, color: icon.fg, fontStyle: 'italic' }}>
            {icon.glyph}
          </span>
        </div>
      )}
      <div style={{
        flex: 1, fontFamily: 'var(--sans)',
        fontSize: t ? 20 : 15,
        color: danger ? '#A04F3A' : 'var(--ink-900)',
        fontWeight: 500,
      }}>{title}</div>
      {onToggle != null ? (
        <Toggle checked={!!checked} onChange={onToggle} size={t ? 'lg' : 'sm'} />
      ) : detail ? (
        <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 18 : 13, color: 'var(--ink-500)', marginRight: t ? 10 : 6 }}>
          {detail}
        </div>
      ) : null}
      {onClick && !onToggle && (
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none" style={{ marginLeft: 4 }}>
          <path d="M1 1l4 4-4 4" stroke="var(--ink-300)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  )
}

function Card({ children, header, t }) {
  return (
    <div style={{ marginBottom: t ? 32 : 24 }}>
      {header && (
        <div style={{
          fontFamily: 'var(--sans)',
          fontSize: t ? 13 : 11,
          letterSpacing: 1.6,
          color: 'var(--ink-500)',
          textTransform: 'uppercase',
          fontWeight: 700,
          padding: t ? '0 60px 12px' : '0 32px 8px',
        }}>{header}</div>
      )}
      <div style={{
        background: 'var(--bg-paper)',
        borderRadius: t ? 22 : 18,
        margin: t ? '0 48px' : '0 20px',
        overflow: 'hidden',
        border: '1px solid var(--hairline)',
      }}>{children}</div>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { entries } = useEntries()
  const bp = useBreakpoint()
  const t = bp.isTabletPortrait

  const [authMethod, setAuthMethod] = useState(null)
  useEffect(() => {
    if (!user) return
    db.localAuth.get(user.id).then(auth => setAuthMethod(auth?.method || null))
  }, [user])

  const [promptEnabled, setPromptEnabled] = useState(
    () => localStorage.getItem('solace_daily_prompt') !== 'false'
  )
  const handlePromptToggle = (val) => {
    setPromptEnabled(val)
    localStorage.setItem('solace_daily_prompt', val ? 'true' : 'false')
  }

  const [moodEnabled, setMoodEnabled] = useState(
    () => localStorage.getItem('solace_mood_tracking') !== 'false'
  )
  const handleMoodToggle = (val) => {
    setMoodEnabled(val)
    localStorage.setItem('solace_mood_tracking', val ? 'true' : 'false')
  }

  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState(
    () => localStorage.getItem('solace_reminder_time') || '21:00'
  )
  const [streakNudge, setStreakNudge] = useState(
    () => localStorage.getItem('solace_streak_nudge') === 'true'
  )
  const [reminderLoading, setReminderLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    Promise.all([isSubscribed(), fetchSubscription(user.id)]).then(([subscribed, row]) => {
      setReminderEnabled(subscribed)
      if (row) {
        // row.reminder_time is stored as UTC — convert back to local for display
        const [h] = row.reminder_time.split(':').map(Number)
        const d = new Date(); d.setUTCHours(h, 0, 0, 0)
        const localTime = d.getHours().toString().padStart(2, '0') + ':00'
        setReminderTime(localTime)
        localStorage.setItem('solace_reminder_time', localTime)
        setStreakNudge(row.streak_nudge)
        localStorage.setItem('solace_streak_nudge', row.streak_nudge ? 'true' : 'false')
      }
    }).catch(() => {})
  }, [user])

  const handleReminderToggle = async (val) => {
    if (reminderLoading) return
    setReminderLoading(true)
    try {
      if (val) {
        const granted = await requestPermission()
        if (!granted) { setReminderLoading(false); return }
        await subscribeToPush(user.id, reminderTime, streakNudge)
        setReminderEnabled(true)
      } else {
        await unsubscribeFromPush(user.id)
        setReminderEnabled(false)
      }
    } catch { /* ignore */ }
    setReminderLoading(false)
  }

  const handleReminderTimeChange = async (val) => {
    setReminderTime(val)
    localStorage.setItem('solace_reminder_time', val)
    if (reminderEnabled) {
      try { await updateReminderSettings(user.id, val, streakNudge) } catch { /* ignore */ }
    }
  }

  const handleStreakNudgeToggle = async (val) => {
    setStreakNudge(val)
    localStorage.setItem('solace_streak_nudge', val ? 'true' : 'false')
    if (reminderEnabled) {
      try { await updateReminderSettings(user.id, reminderTime, val) } catch { /* ignore */ }
    }
  }

  const { theme, setTheme } = useTheme()

  const initial = user?.email?.[0]?.toUpperCase() || 'J'
  const entryCount = entries.length
  const wordCount = entries.reduce((sum, e) => sum + (e.wordCount || 0), 0)
  const wordCountLabel = wordCount >= 1000 ? `${(wordCount / 1000).toFixed(1)}k` : String(wordCount)
  const streak = calculateStreak(entries)

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/', { replace: true })
    } catch {
      // Silently ignore logout errors
    }
  }

  const handleLockJournal = async () => {
    clearKey()
    navigate('/unlock', { replace: true })
  }

  const handleReenrollBiometrics = async () => {
    await db.localAuth.delete(user.id)
    navigate('/phrase')
  }

  const handleExport = () => {
    alert('Export & backup coming soon.')
  }

  return (
    <div style={{
      flex: 1, minHeight: '100%',
      background: 'var(--bg-cream)',
      display: 'flex', flexDirection: 'column',
    }}>
      <StatusBar />

      {/* Header */}
      <div style={{ padding: t ? '32px 48px 0' : '46px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: t ? 48 : 36, height: t ? 48 : 36,
            borderRadius: t ? 24 : 18, background: 'var(--bg-paper)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="var(--ink-900)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ fontFamily: 'var(--serif)', fontSize: t ? 28 : 17, fontWeight: 500, color: 'var(--ink-900)' }}>You</div>
        <div style={{ width: t ? 48 : 36 }} />
      </div>

      <div className="page-scroll" style={{ flex: 1, paddingBottom: 80 }}>
        {/* Profile */}
        <div style={{ padding: t ? '44px 48px 48px' : '28px 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: t ? 114 : 78, height: t ? 114 : 78,
            borderRadius: t ? 57 : 39, background: 'var(--terra-100)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontSize: t ? 52 : 36, fontStyle: 'italic',
            color: 'var(--terra-400)', fontWeight: 400,
          }}>
            {initial}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: t ? 34 : 22, fontWeight: 500, marginTop: t ? 16 : 10, color: 'var(--ink-900)' }}>
            {user?.email?.split('@')[0] || 'Journaler'}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: t ? 17 : 13, fontStyle: 'italic', color: 'var(--ink-500)', marginTop: 3 }}>
            {user?.email}
          </div>

          <div style={{ display: 'flex', gap: t ? 60 : 32, marginTop: t ? 28 : 18 }}>
            {[[String(entryCount), 'entries'], [String(streak), 'streak'], [wordCountLabel, 'words']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: t ? 36 : 22, fontWeight: 500, color: 'var(--ink-900)' }}>{n}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 13 : 11, letterSpacing: 1.2, color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 600, marginTop: t ? 5 : 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <Card header="Appearance" t={t}>
          <div style={{
            padding: t ? '24px 28px 20px' : '18px 20px 14px',
            display: 'flex',
            justifyContent: 'space-around',
          }}>
            {THEMES.map(th => {
              const selected = theme === th.id
              return (
                <button
                  key={th.id}
                  onClick={() => setTheme(th.id)}
                  aria-label={th.label}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: t ? 8 : 6,
                    background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
                  }}
                >
                  <div style={{
                    width: t ? 56 : 44, height: t ? 56 : 44,
                    borderRadius: '50%',
                    background: th.bg,
                    border: `2px solid ${th.accent}`,
                    boxShadow: selected ? `0 0 0 2.5px var(--ink-900)` : 'none',
                    transition: 'box-shadow 0.15s',
                  }} />
                  <span style={{
                    fontFamily: 'var(--sans)',
                    fontSize: t ? 12 : 10,
                    color: selected ? 'var(--ink-900)' : 'var(--ink-500)',
                    fontWeight: selected ? 600 : 400,
                    letterSpacing: 0.3,
                  }}>{th.label}</span>
                </button>
              )
            })}
          </div>
        </Card>

        <Card header="Practice" t={t}>
          <Row t={t} icon={{ bg: 'var(--terra-100)', fg: 'var(--terra-400)', glyph: 'p' }} title="Daily prompt" checked={promptEnabled} onToggle={handlePromptToggle} />
          <Row t={t} icon={{ bg: 'var(--bg-warm)', fg: 'var(--ink-700)', glyph: 'm' }} title="Mood tracking" checked={moodEnabled} onToggle={handleMoodToggle} last={!moodEnabled} />
          {moodEnabled && <Row t={t} icon={{ bg: 'var(--bg-warm)', fg: 'var(--ink-700)', glyph: '↗' }} title="Mood insights" onClick={() => navigate('/mood-insights')} last />}
        </Card>

        <Card header="Reminders" t={t}>
          <Row t={t}
            icon={{ bg: 'var(--sage-100)', fg: '#5C6F4F', glyph: 'r' }}
            title={reminderLoading ? 'Setting up…' : 'Daily reminder'}
            checked={reminderEnabled}
            onToggle={handleReminderToggle}
            last={!reminderEnabled}
          />
          {reminderEnabled && (
            <div style={{ padding: t ? '0 28px 0 80px' : '0 16px 0 52px', borderBottom: '1px solid var(--hairline)', minHeight: t ? 72 : 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 20 : 15, color: 'var(--ink-900)', fontWeight: 500 }}>Time</div>
              <input
                type="time"
                value={reminderTime}
                step="3600"
                onChange={e => {
                  // Snap to whole hour — cron runs hourly so :30 would never fire
                  const snapped = e.target.value.slice(0, 3) + '00'
                  handleReminderTimeChange(snapped)
                }}
                style={{ fontFamily: 'var(--sans)', fontSize: t ? 18 : 15, color: 'var(--ink-700)', background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }}
              />
            </div>
          )}
          {reminderEnabled && (
            <Row t={t}
              icon={{ bg: 'var(--terra-100)', fg: 'var(--terra-400)', glyph: '🔥' }}
              title="Streak nudge"
              checked={streakNudge}
              onToggle={handleStreakNudgeToggle}
              last
            />
          )}
        </Card>

        <Card header="Privacy" t={t}>
          <Row t={t} icon={{ bg: 'var(--bg-cream)', fg: 'var(--ink-700)', glyph: '⊙' }} title="Lock journal" onClick={handleLockJournal} />
          {authMethod === 'prf' && <Row t={t} icon={{ bg: 'var(--terra-50)', fg: 'var(--terra-400)', glyph: '↺' }} title="Re-enroll Face ID" onClick={handleReenrollBiometrics} />}
          <Row t={t} icon={{ bg: 'var(--bg-cream)', fg: 'var(--ink-700)', glyph: '↓' }} title="Export & backup" last onClick={handleExport} />
        </Card>

        <Card header="Account" t={t}>
          <Row t={t} title="Sign out" danger onClick={handleLogout} last />
        </Card>

        <div style={{
          padding: t ? '0 64px 28px' : '0 32px 24px',
          fontFamily: 'var(--serif)', fontStyle: 'italic',
          fontSize: t ? 15 : 12, color: 'var(--ink-300)',
          textAlign: 'center', lineHeight: 1.6,
        }}>
          Your entries are encrypted with your recovery phrase.
          Solace cannot read them — ever.
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}

function calculateStreak(entries) {
  if (!entries.length) return 0
  const days = new Set(
    entries.map(e => {
      const d = new Date(e.client_updated_at || e.created_at)
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    }),
  )
  let streak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (days.has(key)) streak++
    else if (i > 0) break
  }
  return streak
}
