import { useNavigate } from 'react-router-dom'
import MoodDot from './MoodDot'

export default function EntryCard({ entry }) {
  const navigate = useNavigate()

  const date = new Date(entry.client_updated_at || entry.created_at)
  const day = String(date.getDate()).padStart(2, '0')
  const monthShort = date.toLocaleString('en', { month: 'short' }).toUpperCase()

  return (
    <div
      style={{ display: 'flex', gap: 14, marginBottom: 22, position: 'relative', cursor: 'pointer' }}
      onClick={() => navigate(`/entry/${entry.id}`)}
    >
      {/* Date column */}
      <div style={{ width: 36, textAlign: 'right', flexShrink: 0 }}>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 22,
            fontWeight: 400,
            color: 'var(--ink-900)',
            lineHeight: 1,
          }}
        >
          {day}
        </div>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 9,
            letterSpacing: 1.2,
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
            marginTop: 2,
            fontWeight: 600,
          }}
        >
          {monthShort}
        </div>
      </div>

      {/* Mood dot on timeline */}
      <div
        style={{
          width: 14,
          height: 14,
          borderRadius: 7,
          background: 'var(--bg-warm)',
          border: `2px solid ${entry.mood ? getMoodDot(entry.mood) : 'var(--ink-300)'}`,
          flexShrink: 0,
          marginTop: 6,
          zIndex: 2,
        }}
      />

      {/* Content card */}
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          background: 'var(--bg-paper)',
          borderRadius: 14,
          boxShadow: '0 1px 2px rgba(58,51,43,0.04)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--ink-900)',
            lineHeight: 1.25,
          }}
        >
          {entry.title || 'Untitled'}
        </div>
        {entry.body && (
          <div
            className="line-clamp-2"
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 12,
              color: 'var(--ink-500)',
              lineHeight: 1.5,
              marginTop: 4,
            }}
          >
            {entry.body}
          </div>
        )}
        {entry.mood && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
            <MoodDot mood={entry.mood} size={6} />
            <span
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 11,
                color: 'var(--ink-500)',
              }}
            >
              {entry.mood}
              {entry.wordCount > 0 && ` · ${entry.wordCount} words`}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function getMoodDot(mood) {
  const dots = {
    calm: '#9CA888',
    tender: '#D8A892',
    restless: '#B89678',
    warm: '#B8896C',
    hopeful: '#C9B080',
    heavy: '#8B7E6E',
  }
  return dots[mood] || 'var(--ink-300)'
}
