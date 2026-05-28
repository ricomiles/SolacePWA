import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useSync } from '../hooks/useSync'

const MOOD_COLORS = {
  calm: '#9CA888',
  tender: '#D8A892',
  restless: '#B89678',
  warm: '#B8896C',
  hopeful: '#C9B080',
  heavy: '#8B7E6E',
}

const FILTERS = ['All', 'This week', 'This month']

function EntryRow({ entry, active }) {
  const navigate = useNavigate()
  const date = new Date(entry.client_updated_at || entry.created_at)
  const day = String(date.getDate()).padStart(2, '0')
  const wd = date.toLocaleString('en', { weekday: 'short' })
  const month = date.toLocaleString('en', { month: 'short' })
  const moodColor = entry.mood ? (MOOD_COLORS[entry.mood] || 'var(--ink-300)') : 'var(--ink-200)'

  return (
    <div
      onClick={() => navigate(`/entry/${entry.id}`)}
      style={{
        padding: '14px 20px',
        borderLeft: `2px solid ${active ? 'var(--terra-300)' : 'transparent'}`,
        background: active ? 'var(--bg-paper)' : 'transparent',
        borderBottom: '1px solid var(--hairline)',
        cursor: 'pointer',
        transition: 'background 0.1s',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(58,51,43,0.03)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
        <span style={{
          fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 400, color: 'var(--ink-900)', lineHeight: 1,
        }}>{day}</span>
        <span style={{
          fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.12em',
          textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 600,
        }}>{wd} · {month}</span>
        <span style={{ flex: 1 }} />
        <span style={{
          width: 6, height: 6, borderRadius: 3, background: moodColor, alignSelf: 'center', flexShrink: 0,
        }} />
      </div>
      <div style={{
        fontFamily: 'var(--serif)', fontSize: 14, fontWeight: 500, color: 'var(--ink-900)',
        lineHeight: 1.3, marginBottom: 4,
      }}>
        {entry.title || 'Untitled'}
      </div>
      {entry.body && (
        <div style={{
          fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {entry.body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}
        </div>
      )}
      <div style={{
        display: 'flex', gap: 6, marginTop: 6,
        fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--ink-500)', fontWeight: 600,
        alignItems: 'center',
      }}>
        {entry.wordCount > 0 && <span>{entry.wordCount}w</span>}
        {entry.mood && <span style={{ color: 'var(--ink-300)' }}>· {entry.mood}</span>}
      </div>
    </div>
  )
}

export default function EntriesPanel({ width = 360 }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { entries, loading } = useEntries()
  const { syncing, pendingCount } = useSync()
  const [activeFilter, setActiveFilter] = useState(0)

  // Highlight the active entry from the current route
  const activeId = location.pathname.startsWith('/entry/')
    ? location.pathname.replace('/entry/', '')
    : location.pathname.startsWith('/edit/')
    ? location.pathname.replace('/edit/', '')
    : null

  const now = new Date()
  const filtered = entries.filter(e => {
    if (activeFilter === 0) return true
    const d = new Date(e.client_updated_at || e.created_at)
    if (activeFilter === 1) {
      const cutoff = new Date(now)
      cutoff.setDate(cutoff.getDate() - 7)
      return d >= cutoff
    }
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const monthName = now.toLocaleString('en', { month: 'long' })

  return (
    <div style={{
      width, height: '100%', background: 'var(--bg-cream)',
      borderRight: '1px solid var(--hairline)',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 18px 12px', borderBottom: '1px solid var(--hairline)',
        background: 'var(--bg-cream)', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{
            fontFamily: 'var(--serif)', fontSize: 22, fontWeight: 400,
            color: 'var(--ink-900)', letterSpacing: '-0.01em',
          }}>
            {monthName}<span style={{ color: 'var(--terra-300)' }}>.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {(syncing || pendingCount > 0) && (
              <span style={{ fontFamily: 'var(--sans)', fontSize: 10, color: 'var(--ink-400)' }}>
                {syncing ? 'syncing…' : `${pendingCount} pending`}
              </span>
            )}
            <button
              onClick={() => navigate('/new')}
              title="New entry (⌘N)"
              style={{
                width: 28, height: 28, borderRadius: 14, background: 'var(--ink-900)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="var(--bg-paper)" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {FILTERS.map((f, i) => (
            <button
              key={f}
              onClick={() => setActiveFilter(i)}
              style={{
                padding: '4px 10px', borderRadius: 999, border: 'none',
                fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600,
                background: i === activeFilter ? 'var(--ink-900)' : 'transparent',
                color: i === activeFilter ? 'var(--bg-paper)' : 'var(--ink-500)',
                outline: i !== activeFilter ? '1px solid var(--hairline)' : 'none',
                cursor: 'pointer', transition: 'all 0.1s',
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-500)',
          }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{
            padding: '40px 20px', textAlign: 'center',
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-500)',
          }}>
            {entries.length === 0 ? 'Your journal is empty.' : 'No entries in this period.'}
          </div>
        ) : (
          filtered.map(entry => (
            <EntryRow key={entry.id} entry={entry} active={entry.id === activeId} />
          ))
        )}
      </div>
    </div>
  )
}
