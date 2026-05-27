import { useNavigate, useLocation } from 'react-router-dom'
import { SolaceLogoInline } from './SolaceLogo'
import { useEntries } from '../hooks/useEntries'
import { useAuth } from '../hooks/useAuth'

const MOOD_COLORS = {
  calm: '#9CA888',
  tender: '#D8A892',
  restless: '#B89678',
  warm: '#B8896C',
  hopeful: '#C9B080',
  heavy: '#8B7E6E',
}

function NavItem({ label, count, active, dot, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, height: 32,
        padding: '0 12px', borderRadius: 8, cursor: 'pointer',
        background: active ? 'var(--terra-50)' : 'transparent',
        fontFamily: 'var(--sans)', fontSize: 13, fontWeight: active ? 600 : 500,
        color: active ? 'var(--ink-900)' : 'var(--ink-700)',
        transition: 'background 0.12s',
        userSelect: 'none',
      }}
    >
      {dot
        ? <span style={{ width: 8, height: 8, borderRadius: 4, background: dot, flexShrink: 0 }} />
        : <span style={{
            width: 8, height: 8, borderRadius: 2, flexShrink: 0,
            background: active ? 'var(--terra-300)' : 'var(--ink-300)', opacity: 0.6,
          }} />
      }
      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}
      </span>
      {count != null && (
        <span style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-500)', fontWeight: 500 }}>
          {count}
        </span>
      )}
    </div>
  )
}

function SectionLabel({ children, onAdd }) {
  return (
    <div style={{
      padding: '14px 16px 6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.16em',
      textTransform: 'uppercase', color: 'var(--ink-300)', fontWeight: 700,
    }}>
      <span>{children}</span>
      {onAdd && (
        <span
          onClick={onAdd}
          style={{ color: 'var(--ink-500)', fontSize: 16, lineHeight: 1, cursor: 'pointer' }}
        >+</span>
      )}
    </div>
  )
}

function computeStreak(entries) {
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
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    if (days.has(key)) streak++
    else break
  }
  return streak
}

export default function DesktopSidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { entries } = useEntries()
  const { user } = useAuth()

  const isJournalActive = ['/home', '/new'].includes(location.pathname) ||
    location.pathname.startsWith('/entry/') ||
    location.pathname.startsWith('/edit/')

  const streak = computeStreak(entries)
  const initial = user?.email?.[0]?.toUpperCase() || 'S'

  // Unique moods from entries as "tags"
  const moodTags = [...new Set(entries.map(e => e.mood).filter(Boolean))].slice(0, 7)

  return (
    <div style={{
      width: 240, height: '100%', background: 'var(--bg-cream)',
      borderRight: '1px solid var(--hairline)',
      display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 10px' }}>
        <SolaceLogoInline size={16} />
      </div>

      {/* Search */}
      <div style={{ padding: '8px 12px 6px' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, height: 30,
          padding: '0 10px', borderRadius: 8, background: 'rgba(58,51,43,0.05)',
          fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', cursor: 'text',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <circle cx="5" cy="5" r="3.5" stroke="var(--ink-500)" strokeWidth="1.4" fill="none" />
            <path d="M7.5 7.5l3 3" stroke="var(--ink-500)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span style={{ flex: 1 }}>Search entries</span>
          <span style={{
            fontSize: 10, color: 'var(--ink-300)', padding: '2px 5px',
            borderRadius: 3, background: 'rgba(255,255,255,0.6)',
          }}>⌘K</span>
        </div>
      </div>

      <SectionLabel>Journal</SectionLabel>
      <div style={{ padding: '0 6px' }}>
        <NavItem
          label="Today"
          active={isJournalActive}
          dot="var(--terra-300)"
          onClick={() => navigate('/home')}
        />
        <NavItem
          label="All entries"
          count={entries.length || null}
          active={false}
          onClick={() => navigate('/home')}
        />
        <NavItem
          label="Calendar"
          active={location.pathname === '/calendar'}
          onClick={() => navigate('/calendar')}
        />
      </div>

      {moodTags.length > 0 && (
        <>
          <SectionLabel>Moods</SectionLabel>
          <div style={{ padding: '0 16px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {moodTags.map(tag => (
              <span key={tag} style={{
                fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-700)', fontWeight: 500,
                padding: '3px 8px', borderRadius: 999, background: 'rgba(58,51,43,0.04)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: MOOD_COLORS[tag] || 'var(--ink-300)' }} />
                {tag}
              </span>
            ))}
          </div>
        </>
      )}

      <div style={{ flex: 1 }} />

      {/* New entry */}
      <div style={{ padding: '0 10px 10px' }}>
        <button
          onClick={() => navigate('/new')}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 12, border: 'none',
            background: 'var(--ink-900)', color: 'var(--bg-paper)',
            fontFamily: 'var(--sans)', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            transition: 'opacity 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M1.5 9.5L9 2l2.5 2.5-7.5 7.5H1.5v-2.5z" stroke="var(--bg-paper)" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
          </svg>
          New entry
          <span style={{
            marginLeft: 'auto', fontSize: 10, color: 'rgba(250,245,236,0.45)',
            padding: '1px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: 3,
          }}>⌘N</span>
        </button>
      </div>

      {/* Profile card */}
      <div style={{ padding: '6px 12px 14px', borderTop: '1px solid var(--hairline)' }}>
        <div
          onClick={() => navigate('/settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
            borderRadius: 10, background: 'var(--bg-paper)', cursor: 'pointer',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-warm)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-paper)'}
        >
          <div style={{
            width: 28, height: 28, borderRadius: 14, background: 'var(--terra-200)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 13, color: 'var(--bg-paper)', fontWeight: 500,
          }}>{initial}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
              color: 'var(--ink-900)', lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{user?.email?.split('@')[0] || 'You'}</div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-500)', marginTop: 1 }}>
              {streak > 0 ? `${streak} day streak` : 'Start your streak'}
            </div>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <circle cx="6" cy="3" r="1" fill="var(--ink-300)" />
            <circle cx="6" cy="6" r="1" fill="var(--ink-300)" />
            <circle cx="6" cy="9" r="1" fill="var(--ink-300)" />
          </svg>
        </div>
      </div>
    </div>
  )
}
