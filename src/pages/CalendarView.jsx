import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import TabBar from '../components/TabBar'
import OfflineBanner from '../components/OfflineBanner'

const DOW_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const MOOD_COLORS = {
  calm: '#9CA888',
  tender: '#D8A892',
  restless: '#B89678',
  warm: '#B8896C',
  hopeful: '#C9B080',
  heavy: '#8B7E6E',
}

export default function CalendarView() {
  const navigate = useNavigate()
  const { entries } = useEntries()

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('en', { month: 'long' })

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7

  // Build a map of day → entries for this month
  const entriesByDay = {}
  for (const entry of entries) {
    const d = new Date(entry.client_updated_at || entry.created_at)
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate()
      if (!entriesByDay[day]) entriesByDay[day] = []
      entriesByDay[day].push(entry)
    }
  }

  const goToPrevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
    setSelectedDay(null)
  }

  const goToNextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
    setSelectedDay(null)
  }

  const selectedEntries = selectedDay ? (entriesByDay[selectedDay] || []) : []

  // Mood legend
  const moodCounts = {}
  for (const entry of entries) {
    const d = new Date(entry.client_updated_at || entry.created_at)
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth && entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    }
  }

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--bg-paper)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusBar />
      <OfflineBanner />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '46px 24px 0' }}>
        <button
          onClick={() => navigate('/home')}
          style={{
            width: 36, height: 36, borderRadius: 18, background: 'var(--bg-cream)',
            border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="var(--ink-900)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, fontStyle: 'italic', color: 'var(--ink-900)' }}>
          journal
        </div>
        <div style={{ width: 36 }} />
      </div>

      {/* Month header */}
      <div style={{ padding: '32px 28px 0' }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: 2, color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 600 }}>
          {viewYear}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 400, letterSpacing: -1, margin: 0, lineHeight: 1, color: 'var(--ink-900)' }}>
            {monthName}<span style={{ color: 'var(--terra-300)' }}>.</span>
          </h1>
          <div style={{ display: 'flex', gap: 6 }}>
            {['‹', '›'].map((g, i) => (
              <button
                key={i}
                onClick={i === 0 ? goToPrevMonth : goToNextMonth}
                style={{
                  width: 32, height: 32, borderRadius: 16, background: 'var(--bg-cream)',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--ink-700)', fontSize: 18, cursor: 'pointer',
                }}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-500)', marginTop: 6 }}>
          {Object.values(entriesByDay).reduce((a, arr) => a + arr.length, 0)} entries this month
        </div>
      </div>

      {/* Day-of-week labels */}
      <div style={{ padding: '28px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {DOW_LABELS.map((d, i) => (
          <div key={i} style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: 1.4, color: 'var(--ink-500)', textAlign: 'center', fontWeight: 700, padding: '4px 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ padding: '4px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: totalCells }, (_, i) => {
          const day = i - firstDay + 1
          const isValid = day >= 1 && day <= daysInMonth
          const isToday = isValid && day === today.getDate() && viewYear === today.getFullYear() && viewMonth === today.getMonth()
          const isSelected = isValid && day === selectedDay
          const dayEntries = isValid ? (entriesByDay[day] || []) : []
          const hasEntry = dayEntries.length > 0
          const moodDot = dayEntries[0]?.mood ? MOOD_COLORS[dayEntries[0].mood] : null

          return (
            <div
              key={i}
              onClick={() => isValid && setSelectedDay(day)}
              style={{
                aspectRatio: '1',
                borderRadius: 12,
                position: 'relative',
                background: isSelected ? 'var(--terra-100)' : isToday ? 'var(--ink-900)' : hasEntry ? 'var(--bg-cream)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--serif)',
                fontSize: 16,
                fontWeight: 400,
                color: isToday ? 'var(--bg-paper)' : !isValid ? 'var(--ink-200)' : 'var(--ink-900)',
                cursor: isValid ? 'pointer' : 'default',
                transition: 'background 0.15s',
              }}
            >
              {isValid ? day : ''}
              {hasEntry && !isToday && (
                <div style={{
                  position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
                  width: 5, height: 5, borderRadius: 3,
                  background: moodDot || 'var(--terra-300)',
                }} />
              )}
              {isToday && (
                <div style={{
                  position: 'absolute', bottom: 5, left: '50%', transform: 'translateX(-50%)',
                  width: 5, height: 5, borderRadius: 3, background: 'var(--terra-200)',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mood legend */}
      {Object.keys(moodCounts).length > 0 && (
        <div style={{ padding: '20px 28px 0' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: 1.6, color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10 }}>
            This month's moods
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.entries(moodCounts).map(([mood, count]) => (
              <div key={mood} style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-700)', fontWeight: 500 }}>
                <span style={{ width: 8, height: 8, borderRadius: 4, background: MOOD_COLORS[mood] || 'var(--ink-300)' }} />
                {mood}
                <span style={{ color: 'var(--ink-300)', fontWeight: 400 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected day card */}
      {selectedDay && (
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{ padding: '16px 18px', background: 'var(--terra-50)', borderRadius: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: 1.6, color: 'var(--terra-400)', textTransform: 'uppercase', fontWeight: 700 }}>
                {selectedDay === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear()
                  ? 'Today'
                  : `${monthName} ${selectedDay}`}
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>
                {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
              </div>
            </div>
            {selectedEntries.length > 0 ? (
              selectedEntries.map((entry) => (
                <div
                  key={entry.id}
                  onClick={() => navigate(`/entry/${entry.id}`)}
                  style={{ fontFamily: 'var(--serif)', fontSize: 17, fontWeight: 500, marginTop: 6, cursor: 'pointer', color: 'var(--ink-900)' }}
                >
                  {entry.title || 'Untitled'}
                </div>
              ))
            ) : (
              <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-500)', marginTop: 6 }}>
                No entry for this day.{' '}
                <span
                  onClick={() => navigate('/new')}
                  style={{ color: 'var(--terra-400)', cursor: 'pointer', fontWeight: 600, fontStyle: 'normal' }}
                >
                  Write one?
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ flex: 1 }} />

      <TabBar />
      <HomeIndicator />
    </div>
  )
}
