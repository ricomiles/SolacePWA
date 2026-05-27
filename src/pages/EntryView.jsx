import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'
import { getKey } from '../store/cryptoStore'
import { decrypt } from '../crypto'
import { useEntries } from '../hooks/useEntries'
import { useBreakpoint } from '../hooks/useBreakpoint'
import MoodDot from '../components/MoodDot'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

const MOOD_COLORS = {
  calm: '#9CA888',
  tender: '#D8A892',
  restless: '#B89678',
  warm: '#B8896C',
  hopeful: '#C9B080',
  heavy: '#8B7E6E',
}

function useEntryData(id) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mood, setMood] = useState(null)
  const [loading, setLoading] = useState(true)

  const rawEntry = useLiveQuery(() => db.entries.get(id), [id])

  useEffect(() => {
    if (!rawEntry) return
    const key = getKey()
    if (!key) return

    decrypt(key, rawEntry.ciphertext, rawEntry.iv)
      .then(plaintext => {
        const parsed = JSON.parse(plaintext)
        setTitle(parsed.title || 'Untitled')
        setBody(parsed.body || '')
        setMood(parsed.mood || null)
        setLoading(false)
      })
      .catch(() => {
        setTitle('[Decryption failed]')
        setLoading(false)
      })
  }, [rawEntry])

  return { rawEntry, title, body, mood, loading }
}

// ── Desktop / iPad landscape reading pane ─────────────────────────────────────
function DesktopReadingPane({ id }) {
  const navigate = useNavigate()
  const { rawEntry, title, body, mood, loading } = useEntryData(id)
  const { deleteEntry } = useEntries()

  if (loading) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-paper)' }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-500)', fontSize: 16 }}>Loading…</div>
      </div>
    )
  }

  const date = rawEntry ? new Date(rawEntry.client_updated_at || rawEntry.created_at) : new Date()
  const wd = date.toLocaleString('en', { weekday: 'short' })
  const day = date.getDate()
  const month = date.toLocaleString('en', { month: 'long' })
  const year = date.getFullYear()
  const hour = date.getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  const moodColor = mood ? (MOOD_COLORS[mood] || 'var(--ink-300)') : null
  const paragraphs = body.split(/\n+/).filter(p => p.trim())

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    await deleteEntry(id)
    navigate('/home', { replace: true })
  }

  return (
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-paper)', overflow: 'hidden' }}>
      {/* 44px action strip */}
      <div style={{
        height: 44, display: 'flex', alignItems: 'center', padding: '0 24px',
        borderBottom: '1px solid var(--hairline)', gap: 8, flexShrink: 0,
      }}>
        {moodColor && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.13em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: moodColor }} />
            {mood} · {timeOfDay}
          </div>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => navigate(`/edit/${id}`)}
          style={{
            padding: '5px 12px', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
            color: 'var(--bg-paper)', background: 'var(--ink-900)', borderRadius: 6, border: 'none', cursor: 'pointer',
          }}
        >Edit</button>
        <button
          onClick={handleDelete}
          style={{
            padding: '5px 12px', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
            color: 'var(--ink-700)', background: 'transparent', borderRadius: 6, border: 'none', cursor: 'pointer',
          }}
        >Delete</button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflow: 'auto', padding: '56px 96px' }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          {/* Date label */}
          <div style={{
            fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em',
            textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 18,
          }}>
            {wd} · {day} {month} {year}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 48, lineHeight: 1.1,
            letterSpacing: '-0.02em', margin: '0 0 32px', color: 'var(--ink-900)',
          }}>{title}</h1>

          {/* Body paragraphs */}
          {paragraphs.map((para, idx) => {
            if (para.startsWith('>')) {
              return (
                <blockquote key={idx} style={{
                  margin: '0 0 20px', padding: '0 0 0 18px',
                  borderLeft: '2px solid var(--terra-200)',
                  fontFamily: 'var(--serif)', fontStyle: 'italic',
                  fontSize: 19, lineHeight: 1.7, color: 'var(--ink-700)',
                }}>
                  {para.slice(1).trim()}
                </blockquote>
              )
            }
            return (
              <p key={idx} style={{
                fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.7,
                color: 'var(--ink-700)', margin: '0 0 20px', letterSpacing: '-0.005em',
              }}>{para}</p>
            )
          })}

          {/* Tags + word count */}
          <div style={{ marginTop: 40, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {mood && (
              <span style={{
                padding: '4px 12px', borderRadius: 999, border: '1px solid var(--hairline-strong)',
                fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 500, color: 'var(--ink-700)',
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: 3, background: moodColor }} />
                {mood}
              </span>
            )}
            <span style={{
              marginLeft: 'auto', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', fontWeight: 500,
            }}>
              {wordCount} words
            </span>
          </div>

          {/* On this day */}
          <div style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--hairline)' }}>
            <div style={{
              fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 14,
            }}>
              On this day
            </div>
            <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 14, color: 'var(--ink-500)' }}>
              No entries from previous years on this day.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mobile / iPad portrait reading view ───────────────────────────────────────
function MobileReadingView({ id }) {
  const navigate = useNavigate()
  const { rawEntry, title, body, mood, loading } = useEntryData(id)
  const { entries, deleteEntry } = useEntries()
  const { isTabletPortrait: t } = useBreakpoint()

  const entryIndex = entries.findIndex(e => e.id === id) + 1

  const handleDelete = async () => {
    if (!window.confirm('Delete this entry? This cannot be undone.')) return
    await deleteEntry(id)
    navigate('/home', { replace: true })
  }

  if (loading) {
    return (
      <div style={{ flex: 1, background: 'var(--bg-paper)', display: 'flex', flexDirection: 'column' }}>
        <StatusBar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-500)' }}>
          Loading…
        </div>
      </div>
    )
  }

  const date = rawEntry ? new Date(rawEntry.client_updated_at || rawEntry.created_at) : new Date()
  const dateLabel = date.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'long' })
  const hour = date.getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const wordCount = body.trim().split(/\s+/).filter(Boolean).length
  const paragraphs = body.split(/\n+/).filter(p => p.trim())

  return (
    <div style={{ flex: 1, background: 'var(--bg-paper)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: t ? '24px 56px 0' : '20px 20px 0', flexShrink: 0 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ width: t ? 48 : 36, height: t ? 48 : 36, borderRadius: t ? 24 : 18, background: 'var(--bg-cream)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="var(--ink-900)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 15 : 12, color: 'var(--ink-500)', fontWeight: 500 }}>
          {entryIndex > 0 ? `${entryIndex} of ${entries.length}` : ''}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => navigate(`/edit/${id}`)}
            style={{ width: t ? 48 : 36, height: t ? 48 : 36, borderRadius: t ? 24 : 18, background: 'var(--bg-cream)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 10L9.5 2.5l2 2L4 12H2v-2z" stroke="var(--ink-900)" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            style={{ width: t ? 48 : 36, height: t ? 48 : 36, borderRadius: t ? 24 : 18, background: 'var(--bg-cream)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="3" cy="7" r="1" fill="var(--ink-900)" />
              <circle cx="7" cy="7" r="1" fill="var(--ink-900)" />
              <circle cx="11" cy="7" r="1" fill="var(--ink-900)" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="page-scroll" style={{ flex: 1, padding: t ? '56px 72px 80px' : '36px 32px 80px' }}>
        <div style={{ maxWidth: t ? 720 : undefined, margin: t ? '0 auto' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--sans)', fontSize: t ? 13 : 11, letterSpacing: 1.6, textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700, marginBottom: t ? 22 : 14 }}>
          {dateLabel}
          <span style={{ width: 14, height: 1, background: 'var(--terra-200)', display: 'inline-block' }} />
          {timeOfDay}
        </div>

        <h1 style={{ fontFamily: 'var(--serif)', fontSize: t ? 52 : 32, lineHeight: 1.1, fontWeight: 400, letterSpacing: t ? -1 : -0.6, margin: t ? '0 0 28px' : '0 0 18px', color: 'var(--ink-900)' }}>
          {title}
        </h1>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontFamily: 'var(--sans)', fontSize: t ? 15 : 12, color: 'var(--ink-500)', fontWeight: 500, marginBottom: t ? 32 : 24 }}>
          {mood && (
            <>
              <MoodDot mood={mood} size={6} />
              <span>{mood}</span>
              <span style={{ width: 3, height: 3, borderRadius: 2, background: 'var(--ink-300)', display: 'inline-block' }} />
            </>
          )}
          <span>{wordCount} words</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: t ? 32 : 20 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--hairline-strong)' }} />
          <div style={{ width: 5, height: 5, borderRadius: 3, background: 'var(--terra-200)' }} />
          <div style={{ flex: 1, height: 1, background: 'var(--hairline-strong)' }} />
        </div>

        {paragraphs.map((para, idx) => {
          if (idx === 0 && para.length > 0) {
            const firstChar = para[0]
            const rest = para.slice(1)
            return (
              <p key={idx} style={{ fontFamily: 'var(--serif)', fontSize: t ? 24 : 18, lineHeight: 1.75, color: 'var(--ink-700)', margin: t ? '0 0 24px' : '0 0 16px' }}>
                <span style={{ float: 'left', fontFamily: 'var(--serif)', fontSize: t ? 90 : 56, lineHeight: 0.85, color: 'var(--terra-300)', marginRight: t ? 12 : 8, marginTop: 4, fontWeight: 400 }}>
                  {firstChar}
                </span>
                {rest}
              </p>
            )
          }
          if (para.startsWith('>')) {
            return (
              <blockquote key={idx} style={{ margin: t ? '0 0 24px' : '0 0 16px', padding: '0 0 0 20px', borderLeft: '2px solid var(--terra-200)', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: t ? 24 : 18, lineHeight: 1.6, color: 'var(--ink-900)' }}>
                {para.slice(1).trim()}
              </blockquote>
            )
          }
          return (
            <p key={idx} style={{ fontFamily: 'var(--serif)', fontSize: t ? 24 : 18, lineHeight: 1.75, color: 'var(--ink-700)', margin: t ? '0 0 24px' : '0 0 16px' }}>
              {para}
            </p>
          )
        })}
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}

export default function EntryView() {
  const { id } = useParams()
  const bp = useBreakpoint()

  if (bp.showEntriesPanel) return <DesktopReadingPane id={id} />
  return <MobileReadingView id={id} />
}
