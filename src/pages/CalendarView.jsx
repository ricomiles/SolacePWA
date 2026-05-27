import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useBreakpoint } from '../hooks/useBreakpoint'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import OfflineBanner from '../components/OfflineBanner'

const DOW_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const DOW_LABELS_LONG = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const MOOD_COLORS = {
  calm: '#9CA888',
  tender: '#D8A892',
  restless: '#B89678',
  warm: '#B8896C',
  hopeful: '#C9B080',
  heavy: '#8B7E6E',
}

const MOOD_BG = {
  calm: '#DCDDC7',
  tender: '#E8C4B0',
  restless: '#D9B895',
  warm: '#EDD3BD',
  hopeful: '#E5D2A8',
  heavy: '#C9BCA8',
}

function useCalendarState() {
  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState(today.getDate())

  const monthName = new Date(viewYear, viewMonth, 1).toLocaleString('en', { month: 'long' })
  const yearWords = new Intl.NumberFormat('en', { style: 'decimal' }).format(viewYear)
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

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

  return { today, viewYear, viewMonth, monthName, yearWords, firstDay, daysInMonth, selectedDay, setSelectedDay, goToPrevMonth, goToNextMonth }
}

function getDayMoodData(dayEntries) {
  if (!dayEntries.length) return { dominantMood: null, uniqueMoods: [] }
  const counts = {}
  for (const entry of dayEntries) {
    if (entry.mood) counts[entry.mood] = (counts[entry.mood] || 0) + 1
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  if (!sorted.length) return { dominantMood: null, uniqueMoods: [] }
  return {
    dominantMood: sorted[0][0],
    uniqueMoods: sorted.slice(0, 3).map(([m]) => m),
  }
}

function buildEntriesByDay(entries, viewYear, viewMonth) {
  const map = {}
  for (const entry of entries) {
    const d = new Date(entry.client_updated_at || entry.created_at)
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth) {
      const day = d.getDate()
      if (!map[day]) map[day] = []
      map[day].push(entry)
    }
  }
  return map
}

// ── Desktop calendar pane ─────────────────────────────────────────────────────
function DesktopCalendarPane() {
  const navigate = useNavigate()
  const { entries } = useEntries()
  const { today, viewYear, viewMonth, monthName, firstDay, daysInMonth, selectedDay, setSelectedDay, goToPrevMonth, goToNextMonth } = useCalendarState()

  const entriesByDay = buildEntriesByDay(entries, viewYear, viewMonth)

  // Build desktop grid: Mon-first, so we need to shift firstDay (0=Sun)
  const mondayFirst = (firstDay + 6) % 7
  const blanksBefore = mondayFirst
  const totalCells = blanksBefore + daysInMonth

  const selectedEntries = selectedDay ? (entriesByDay[selectedDay] || []) : []

  const moodCounts = {}
  for (const entry of entries) {
    const d = new Date(entry.client_updated_at || entry.created_at)
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth && entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    }
  }

  return (
    <div style={{ flex: 1, height: '100%', background: 'var(--bg-cream)', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '28px 56px 20px', borderBottom: '1px solid var(--hairline)',
        display: 'flex', alignItems: 'flex-end', gap: 16, flexShrink: 0,
      }}>
        <h1 style={{
          fontFamily: 'var(--serif)', fontSize: 44, fontWeight: 400, color: 'var(--ink-900)',
          letterSpacing: '-0.02em', margin: 0, lineHeight: 1,
        }}>
          {monthName}<span style={{ color: 'var(--terra-300)' }}>.</span>
        </h1>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 20, color: 'var(--ink-500)', paddingBottom: 4 }}>
          {viewYear}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {['‹', '›'].map((c, i) => (
            <button
              key={c}
              onClick={i === 0 ? goToPrevMonth : goToNextMonth}
              style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--hairline)', background: 'var(--bg-paper)', cursor: 'pointer',
                fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink-700)',
              }}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Grid + legend */}
      <div style={{ flex: 1, padding: '20px 56px 24px', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
        {/* Weekday header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8, flexShrink: 0 }}>
          {DOW_LABELS_LONG.map(d => (
            <div key={d} style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, padding: '4px 8px' }}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, flex: 1 }}>
          {Array.from({ length: totalCells }, (_, i) => {
            const day = i - blanksBefore + 1
            const isValid = day >= 1 && day <= daysInMonth
            if (!isValid) return <div key={i} />

            const dayEntries = entriesByDay[day] || []
            const { dominantMood, uniqueMoods } = getDayMoodData(dayEntries)
            const moodBg = dominantMood ? MOOD_BG[dominantMood] : 'var(--bg-paper)'
            const isToday = isValid && day === today.getDate() && viewYear === today.getFullYear() && viewMonth === today.getMonth()
            const isSelected = isValid && day === selectedDay

            return (
              <div
                key={i}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{
                  background: moodBg,
                  borderRadius: 12,
                  padding: '10px 12px',
                  border: isToday ? '2px solid var(--ink-900)' : isSelected ? '2px solid var(--terra-300)' : '1px solid var(--hairline)',
                  minHeight: 80,
                  display: 'flex', flexDirection: 'column',
                  cursor: 'pointer', transition: 'border-color 0.1s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: 18, fontWeight: 500, color: 'var(--ink-900)', lineHeight: 1 }}>{day}</span>
                  {uniqueMoods.length > 0 && (
                    <div style={{ display: 'flex', gap: 3, paddingTop: 2 }}>
                      {uniqueMoods.map(m => (
                        <span key={m} style={{ width: 6, height: 6, borderRadius: 3, background: MOOD_COLORS[m], flexShrink: 0 }} />
                      ))}
                    </div>
                  )}
                </div>
                {dominantMood && (
                  <div style={{ fontFamily: 'var(--sans)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 600, marginTop: 'auto' }}>
                    {dominantMood}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Selected day panel */}
        {selectedDay && selectedEntries.length > 0 && (
          <div style={{ marginTop: 20, padding: '16px 18px', background: 'var(--terra-50)', borderRadius: 14, flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700, marginBottom: 10 }}>
              {monthName} {selectedDay}
            </div>
            {selectedEntries.map(entry => (
              <div
                key={entry.id}
                onClick={() => navigate(`/entry/${entry.id}`)}
                style={{ fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 500, color: 'var(--ink-900)', cursor: 'pointer', marginBottom: 6, lineHeight: 1.3 }}
              >
                {entry.title || 'Untitled'}
              </div>
            ))}
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, paddingTop: 16, fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-500)', fontWeight: 500, flexShrink: 0, flexWrap: 'wrap' }}>
          {Object.entries(MOOD_COLORS).map(([k, v]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: v }} /> {k}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Mobile calendar view ───────────────────────────────────────────────────────
function MobileCalendarView() {
  const navigate = useNavigate()
  const { entries } = useEntries()
  const { today, viewYear, viewMonth, monthName, firstDay, daysInMonth, selectedDay, setSelectedDay, goToPrevMonth, goToNextMonth } = useCalendarState()

  const entriesByDay = buildEntriesByDay(entries, viewYear, viewMonth)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const selectedEntries = selectedDay ? (entriesByDay[selectedDay] || []) : []

  const moodCounts = {}
  for (const entry of entries) {
    const d = new Date(entry.client_updated_at || entry.created_at)
    if (d.getFullYear() === viewYear && d.getMonth() === viewMonth && entry.mood) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
    }
  }

  return (
    <div style={{ flex: 1, background: 'var(--bg-paper)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <OfflineBanner />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '46px 24px 0' }}>
        <button
          onClick={() => navigate('/home')}
          style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--bg-cream)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="var(--ink-900)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 20, fontWeight: 500, fontStyle: 'italic', color: 'var(--ink-900)' }}>Solace</div>
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
                style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--bg-cream)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-700)', fontSize: 18, cursor: 'pointer' }}
              >{g}</button>
            ))}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--serif)', fontSize: 14, fontStyle: 'italic', color: 'var(--ink-500)', marginTop: 6 }}>
          {Object.values(entriesByDay).reduce((a, arr) => a + arr.length, 0)} entries this month
        </div>
      </div>

      {/* DOW labels */}
      <div style={{ padding: '28px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {DOW_LABELS_SHORT.map((d, i) => (
          <div key={i} style={{ fontFamily: 'var(--sans)', fontSize: 10, letterSpacing: 1.4, color: 'var(--ink-500)', textAlign: 'center', fontWeight: 700, padding: '4px 0' }}>{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ padding: '4px 24px 0', display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
        {Array.from({ length: totalCells }, (_, i) => {
          const day = i - firstDay + 1
          const isValid = day >= 1 && day <= daysInMonth
          const isToday = isValid && day === today.getDate() && viewYear === today.getFullYear() && viewMonth === today.getMonth()
          const isSelected = isValid && day === selectedDay
          const dayEntries = isValid ? (entriesByDay[day] || []) : []
          const { dominantMood, uniqueMoods } = getDayMoodData(dayEntries)
          const hasEntry = dayEntries.length > 0
          const moodBg = dominantMood ? MOOD_BG[dominantMood] : 'var(--bg-cream)'

          return (
            <div
              key={i}
              onClick={() => isValid && setSelectedDay(day)}
              style={{
                aspectRatio: '1', borderRadius: 12, position: 'relative',
                background: isSelected ? 'var(--terra-100)' : isToday ? 'var(--ink-900)' : hasEntry ? moodBg : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--serif)', fontSize: 16, fontWeight: 400,
                color: isToday ? 'var(--bg-paper)' : !isValid ? 'var(--ink-200)' : 'var(--ink-900)',
                cursor: isValid ? 'pointer' : 'default', transition: 'background 0.15s',
              }}
            >
              {isValid ? day : ''}
              {hasEntry && !isToday && uniqueMoods.length > 0 && (
                <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2 }}>
                  {uniqueMoods.map(m => (
                    <span key={m} style={{ width: 4, height: 4, borderRadius: 2, background: MOOD_COLORS[m] }} />
                  ))}
                </div>
              )}
              {hasEntry && !isToday && uniqueMoods.length === 0 && (
                <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 2, background: 'var(--terra-300)' }} />
              )}
              {isToday && (
                <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: 2, background: 'var(--terra-200)' }} />
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
                {mood} <span style={{ color: 'var(--ink-300)', fontWeight: 400 }}>{count}</span>
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
                {selectedDay === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear() ? 'Today' : `${monthName} ${selectedDay}`}
              </div>
              <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-500)', fontWeight: 600 }}>
                {selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}
              </div>
            </div>
            {selectedEntries.length > 0 ? (
              selectedEntries.map(entry => (
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
                <span onClick={() => navigate('/new')} style={{ color: 'var(--terra-400)', cursor: 'pointer', fontWeight: 600, fontStyle: 'normal' }}>Write one?</span>
              </div>
            )}
          </div>
        </div>
      )}

      <HomeIndicator />
    </div>
  )
}

export default function CalendarView() {
  const bp = useBreakpoint()
  if (bp.showEntriesPanel) return <DesktopCalendarPane />
  return <MobileCalendarView />
}
