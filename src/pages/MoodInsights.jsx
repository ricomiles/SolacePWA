import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useBreakpoint } from '../hooks/useBreakpoint'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

const MOOD_COLORS = {
  calm:     '#9CA888',
  tender:   '#D8A892',
  restless: '#B89678',
  warm:     '#B8896C',
  hopeful:  '#C9B080',
  heavy:    '#8B7E6E',
}

const MOOD_BG = {
  calm:     '#DCDDC7',
  tender:   '#E8C4B0',
  restless: '#D9B895',
  warm:     '#EDD3BD',
  hopeful:  '#E5D2A8',
  heavy:    '#C9BCA8',
}

const MOOD_ORDER = ['calm', 'tender', 'hopeful', 'warm', 'restless', 'heavy']

function useMoodData(entries) {
  return useMemo(() => {
    const now = new Date()
    const msPerDay = 86_400_000

    // Last 30 days
    const cutoff30 = new Date(now - 30 * msPerDay)
    const recent = entries.filter(e => {
      const d = new Date(e.client_updated_at || e.created_at)
      return d >= cutoff30 && e.mood
    })

    // Distribution
    const counts = {}
    for (const e of recent) counts[e.mood] = (counts[e.mood] || 0) + 1
    const total = Object.values(counts).reduce((a, b) => a + b, 0)
    const distribution = MOOD_ORDER
      .filter(m => counts[m])
      .sort((a, b) => counts[b] - counts[a])
      .map(m => ({ mood: m, count: counts[m], pct: Math.round((counts[m] / total) * 100) }))

    // Time of day breakdown
    const byTime = { morning: {}, afternoon: {}, evening: {} }
    for (const e of recent) {
      const h = new Date(e.client_updated_at || e.created_at).getHours()
      const bucket = h < 12 ? 'morning' : h < 17 ? 'afternoon' : 'evening'
      byTime[bucket][e.mood] = (byTime[bucket][e.mood] || 0) + 1
    }
    const timeBreakdown = Object.entries(byTime).map(([label, mc]) => {
      const sorted = Object.entries(mc).sort((a, b) => b[1] - a[1])
      return { label, top: sorted.slice(0, 2).map(([m]) => m) }
    })

    // Weekly trend — last 8 weeks, dominant mood per week
    const weeks = Array.from({ length: 8 }, (_, i) => {
      const weekStart = new Date(now - (7 - i) * 7 * msPerDay)
      const weekEnd   = new Date(now - (6 - i) * 7 * msPerDay)
      const wEntries = entries.filter(e => {
        const d = new Date(e.client_updated_at || e.created_at)
        return d >= weekStart && d < weekEnd && e.mood
      })
      const wCounts = {}
      for (const e of wEntries) wCounts[e.mood] = (wCounts[e.mood] || 0) + 1
      const dominant = Object.entries(wCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null
      const label = weekStart.toLocaleDateString('en', { month: 'short', day: 'numeric' })
      return { label, dominant, count: wEntries.length }
    })

    // Most journaled mood all-time
    const allCounts = {}
    for (const e of entries) if (e.mood) allCounts[e.mood] = (allCounts[e.mood] || 0) + 1
    const topMood = Object.entries(allCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    return { distribution, timeBreakdown, weeks, topMood, total }
  }, [entries])
}

export default function MoodInsights() {
  const navigate = useNavigate()
  const { entries } = useEntries()
  const { isTabletPortrait: t } = useBreakpoint()
  const { distribution, timeBreakdown, weeks, topMood, total } = useMoodData(entries)

  const maxCount = distribution[0]?.count || 1

  return (
    <div style={{ flex: 1, background: 'var(--bg-cream)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: t ? '32px 48px 0' : '46px 24px 0', gap: 12, flexShrink: 0 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: t ? 48 : 36, height: t ? 48 : 36, borderRadius: t ? 24 : 18, background: 'var(--bg-paper)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="var(--ink-900)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700 }}>Mood</div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: t ? 32 : 26, fontWeight: 400, letterSpacing: -0.5, color: 'var(--ink-900)', margin: 0, lineHeight: 1.1 }}>Insights</h1>
        </div>
      </div>

      <div className="page-scroll" style={{ flex: 1, padding: t ? '40px 48px 80px' : '32px 24px 80px' }}>
        <div style={{ maxWidth: t ? 680 : undefined }}>

          {total === 0 ? (
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-500)', marginTop: 40, textAlign: 'center' }}>
              No mood data yet. Add a mood when writing an entry.
            </div>
          ) : (
            <>
              {/* Distribution */}
              <Section label="Last 30 days" t={t}>
                {distribution.length === 0 ? (
                  <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-500)', padding: '16px 0' }}>No entries with moods in the last 30 days.</div>
                ) : distribution.map(({ mood, count, pct }) => (
                  <div key={mood} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: t ? 14 : 10 }}>
                    <div style={{ width: t ? 72 : 60, fontFamily: 'var(--sans)', fontSize: t ? 13 : 11, color: 'var(--ink-700)', fontWeight: 600, textTransform: 'capitalize', flexShrink: 0 }}>{mood}</div>
                    <div style={{ flex: 1, height: t ? 10 : 8, background: 'var(--hairline)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${(count / maxCount) * 100}%`, height: '100%', background: MOOD_COLORS[mood], borderRadius: 99, transition: 'width 0.4s ease' }} />
                    </div>
                    <div style={{ width: t ? 44 : 36, fontFamily: 'var(--sans)', fontSize: t ? 13 : 11, color: 'var(--ink-500)', fontWeight: 500, textAlign: 'right', flexShrink: 0 }}>{count} <span style={{ color: 'var(--ink-300)' }}>{pct}%</span></div>
                  </div>
                ))}
                {topMood && (
                  <div style={{ marginTop: t ? 20 : 14, padding: '10px 14px', background: MOOD_BG[topMood], borderRadius: 10, fontFamily: 'var(--sans)', fontSize: t ? 13 : 12, color: 'var(--ink-700)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: MOOD_COLORS[topMood], flexShrink: 0 }} />
                    Your most journaled mood is <strong>{topMood}</strong>
                  </div>
                )}
              </Section>

              {/* Time of day */}
              <Section label="Time of day" t={t}>
                <div style={{ display: 'flex', gap: t ? 16 : 10 }}>
                  {timeBreakdown.map(({ label, top }) => (
                    <div key={label} style={{ flex: 1, padding: t ? '16px 14px' : '12px 10px', background: 'var(--bg-paper)', borderRadius: 14, border: '1px solid var(--hairline)' }}>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 11 : 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 10 }}>{label}</div>
                      {top.length === 0 ? (
                        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 12, color: 'var(--ink-300)' }}>—</div>
                      ) : top.map(m => (
                        <div key={m} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                          <span style={{ width: 7, height: 7, borderRadius: 4, background: MOOD_COLORS[m], flexShrink: 0 }} />
                          <span style={{ fontFamily: 'var(--sans)', fontSize: t ? 13 : 12, color: 'var(--ink-700)', fontWeight: 500 }}>{m}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </Section>

              {/* Weekly trend */}
              <Section label="Weekly trend" t={t}>
                <div style={{ display: 'flex', gap: t ? 8 : 5, alignItems: 'flex-end' }}>
                  {weeks.map(({ label, dominant, count }, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: '100%', minHeight: t ? 48 : 36, borderRadius: 8, background: dominant ? MOOD_BG[dominant] : 'var(--hairline)', border: dominant ? 'none' : '1px dashed var(--hairline-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {dominant && <span style={{ width: 8, height: 8, borderRadius: 4, background: MOOD_COLORS[dominant] }} />}
                      </div>
                      <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 10 : 9, color: count > 0 ? 'var(--ink-500)' : 'var(--ink-300)', fontWeight: 600, textAlign: 'center', letterSpacing: 0.2 }}>{label}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: t ? 20 : 14 }}>
                  {MOOD_ORDER.filter(m => MOOD_COLORS[m]).map(m => (
                    <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--sans)', fontSize: t ? 12 : 10, color: 'var(--ink-500)', fontWeight: 500 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 4, background: MOOD_COLORS[m] }} />
                      {m}
                    </span>
                  ))}
                </div>
              </Section>
            </>
          )}
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}

function Section({ label, children, t }) {
  return (
    <div style={{ marginBottom: t ? 40 : 32 }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 12 : 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, marginBottom: t ? 18 : 14 }}>
        {label}
      </div>
      {children}
    </div>
  )
}
