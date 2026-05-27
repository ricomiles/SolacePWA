import { useNavigate } from 'react-router-dom'
import { signOut } from '../services/auth'
import { clearKey } from '../store/cryptoStore'
import { useAuth } from '../hooks/useAuth'
import { useEntries } from '../hooks/useEntries'
import db from '../db'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import TabBar from '../components/TabBar'

function Row({ icon, title, detail, last, danger, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        minHeight: 50,
        padding: '0 16px',
        position: 'relative',
        borderBottom: last ? 'none' : '1px solid var(--hairline)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {icon && (
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: icon.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 14,
              color: icon.fg,
              fontStyle: 'italic',
            }}
          >
            {icon.glyph}
          </span>
        </div>
      )}
      <div
        style={{
          flex: 1,
          fontFamily: 'var(--sans)',
          fontSize: 15,
          color: danger ? '#A04F3A' : 'var(--ink-900)',
          fontWeight: 500,
        }}
      >
        {title}
      </div>
      {detail && (
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 13,
            color: 'var(--ink-500)',
            marginRight: 6,
          }}
        >
          {detail}
        </div>
      )}
      {onClick && (
        <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
          <path d="M1 1l4 4-4 4" stroke="var(--ink-300)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      )}
    </div>
  )
}

function Card({ children, header }) {
  return (
    <div style={{ marginBottom: 24 }}>
      {header && (
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 11,
            letterSpacing: 1.6,
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
            fontWeight: 700,
            padding: '0 32px 8px',
          }}
        >
          {header}
        </div>
      )}
      <div
        style={{
          background: 'var(--bg-paper)',
          borderRadius: 18,
          margin: '0 20px',
          overflow: 'hidden',
          border: '1px solid var(--hairline)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default function Settings() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { entries } = useEntries()

  const initial = user?.email?.[0]?.toUpperCase() || 'J'
  const entryCount = entries.length
  const wordCount = entries.reduce((sum, e) => sum + (e.wordCount || 0), 0)
  const wordCountLabel = wordCount >= 1000 ? `${(wordCount / 1000).toFixed(1)}k` : String(wordCount)

  // Calculate streak
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
    if (user) {
      await db.keyCache.delete(user.id)
    }
    navigate('/phrase', { replace: true })
  }

  const handleExport = () => {
    // Placeholder — export not in Phase 1 scope
    alert('Export & backup coming soon.')
  }

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--bg-cream)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusBar />

      {/* Header */}
      <div style={{ padding: '46px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            width: 36, height: 36, borderRadius: 18, background: 'var(--bg-paper)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="var(--ink-900)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500, color: 'var(--ink-900)' }}>You</div>
        <div style={{ width: 36 }} />
      </div>

      <div className="page-scroll" style={{ flex: 1, paddingBottom: 80 }}>
        {/* Profile */}
        <div style={{ padding: '28px 24px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div
            style={{
              width: 78, height: 78, borderRadius: 39, background: 'var(--terra-100)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--serif)', fontSize: 36, fontStyle: 'italic', color: 'var(--terra-400)', fontWeight: 400,
            }}
          >
            {initial}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, marginTop: 10, color: 'var(--ink-900)' }}>
            {user?.email?.split('@')[0] || 'Journaler'}
          </div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: 13, fontStyle: 'italic', color: 'var(--ink-500)', marginTop: 2 }}>
            {user?.email}
          </div>

          <div style={{ display: 'flex', gap: 32, marginTop: 18 }}>
            {[[String(entryCount), 'entries'], [String(streak), 'streak'], [wordCountLabel, 'words']].map(([n, l]) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 500, color: 'var(--ink-900)' }}>{n}</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: 1.2, color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 600, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <Card header="Practice">
          <Row
            icon={{ bg: 'var(--terra-100)', fg: 'var(--terra-400)', glyph: 'p' }}
            title="Daily prompt"
            detail="Coming soon"
          />
          <Row
            icon={{ bg: 'var(--sage-100)', fg: '#5C6F4F', glyph: 'r' }}
            title="Reminder"
            detail="Coming soon"
          />
          <Row
            icon={{ bg: 'var(--bg-warm)', fg: 'var(--ink-700)', glyph: 'm' }}
            title="Mood tracking"
            detail="On"
            last
          />
        </Card>

        <Card header="Privacy">
          <Row
            icon={{ bg: 'var(--bg-cream)', fg: 'var(--ink-700)', glyph: '⊙' }}
            title="Lock journal"
            detail=""
            onClick={handleLockJournal}
          />
          <Row
            icon={{ bg: 'var(--bg-cream)', fg: 'var(--ink-700)', glyph: '↓' }}
            title="Export & backup"
            last
            onClick={handleExport}
          />
        </Card>

        <Card header="Account">
          <Row
            title="Sign out"
            danger
            onClick={handleLogout}
            last
          />
        </Card>

        <div
          style={{
            padding: '0 32px 24px',
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 12,
            color: 'var(--ink-300)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          Your entries are encrypted with your recovery phrase.
          Solace cannot read them — ever.
        </div>
      </div>

      <TabBar />
      <HomeIndicator />
    </div>
  )
}

function calculateStreak(entries) {
  if (!entries.length) return 0
  const days = new Set(
    entries.map((e) => {
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
    if (days.has(key)) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}
