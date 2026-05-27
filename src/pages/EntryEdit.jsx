import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'
import { getKey } from '../store/cryptoStore'
import { decrypt } from '../crypto'
import { useEntries } from '../hooks/useEntries'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

const AUTO_SAVE_INTERVAL = 2000

export default function EntryEdit() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { updateEntry } = useEntries()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mood, setMood] = useState(null)
  const [savedAt, setSavedAt] = useState(null)
  const [saving, setSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const autoSaveTimer = useRef(null)
  const isDirtyRef = useRef(false)

  // Load entry from IndexedDB
  const rawEntry = useLiveQuery(() => db.entries.get(id), [id])

  useEffect(() => {
    if (!rawEntry || loaded) return
    const key = getKey()
    if (!key) return

    decrypt(key, rawEntry.ciphertext, rawEntry.iv)
      .then((plaintext) => {
        const parsed = JSON.parse(plaintext)
        setTitle(parsed.title || '')
        setBody(parsed.body || '')
        setMood(parsed.mood || null)
        setLoaded(true)
      })
      .catch(() => {
        setLoaded(true)
      })
  }, [rawEntry, loaded])

  // Word count
  useEffect(() => {
    const words = body.trim().split(/\s+/).filter(Boolean)
    setWordCount(words.length)
  }, [body])

  const doSave = useCallback(async () => {
    if (!isDirtyRef.current || !loaded) return
    setSaving(true)
    try {
      await updateEntry(id, { title, body, mood })
      setSavedAt(new Date())
      isDirtyRef.current = false
    } catch {
      // Silently fail — do not log content
    } finally {
      setSaving(false)
    }
  }, [id, title, body, mood, updateEntry, loaded])

  // Auto-save on change
  useEffect(() => {
    if (!loaded) return
    isDirtyRef.current = true
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(doSave, AUTO_SAVE_INTERVAL)
    return () => clearTimeout(autoSaveTimer.current)
  }, [title, body, mood, loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDone = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    await doSave()
    navigate(-1)
  }

  const handleClose = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    doSave().finally(() => navigate(-1))
  }

  const now = new Date()
  const dateLabel = now.toLocaleDateString('en', {
    weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
  }).toUpperCase()
  const hour = now.getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  const savedLabel = savedAt
    ? `saved · ${Math.round((Date.now() - savedAt.getTime()) / 60000) || '<1'}m ago`
    : saving
    ? 'saving…'
    : 'unsaved'

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

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px 0',
          flexShrink: 0,
        }}
      >
        <button
          onClick={handleClose}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--ink-500)',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="var(--ink-500)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Close
        </button>

        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 11,
            color: 'var(--terra-400)',
            fontWeight: 700,
            letterSpacing: 1.4,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              background: saving ? 'var(--terra-200)' : 'var(--terra-300)',
              display: 'inline-block',
            }}
          />
          {savedLabel}
        </div>

        <button
          onClick={handleDone}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--ink-900)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>

      {/* Scrollable content */}
      <div
        className="page-scroll"
        style={{ flex: 1, padding: '36px 32px 120px' }}
      >
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 11,
            letterSpacing: 2,
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 14,
          }}
        >
          {dateLabel} · {timeOfDay}
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title…"
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            fontFamily: 'var(--serif)',
            fontWeight: 400,
            fontSize: 30,
            lineHeight: 1.15,
            letterSpacing: -0.5,
            color: 'var(--ink-900)',
            padding: 0,
            outline: 'none',
            marginBottom: 14,
          }}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              background: mood ? 'var(--sage-100)' : 'transparent',
              border: mood ? 'none' : '1px dashed var(--hairline-strong)',
              borderRadius: 999,
              fontFamily: 'var(--sans)',
              fontSize: 12,
              color: mood ? 'var(--ink-700)' : 'var(--ink-500)',
              fontWeight: 600,
            }}
          >
            {mood ? (
              <>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 3,
                    background: getMoodDot(mood),
                  }}
                />
                {mood}
              </>
            ) : 'no mood'}
          </div>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Continue writing…"
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            fontFamily: 'var(--serif)',
            fontSize: 18,
            lineHeight: 1.65,
            color: 'var(--ink-700)',
            padding: 0,
            outline: 'none',
            letterSpacing: -0.1,
            minHeight: 300,
          }}
          autoFocus={loaded}
        />
      </div>

      {/* Bottom toolbar */}
      <div
        style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'min(calc(100% - 32px), 398px)',
          padding: '10px 14px',
          background: 'var(--bg-cream)',
          borderRadius: 999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(58,51,43,0.06)',
          zIndex: 30,
        }}
      >
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            <path key="b" d="M4 2h5a3 3 0 010 6 3 3 0 010 6H4V2z" stroke="var(--ink-700)" strokeWidth="1.5" fill="none" />,
            <g key="i">
              <line x1="10" y1="2" x2="6" y2="14" stroke="var(--ink-700)" strokeWidth="1.5" />
              <line x1="4" y1="2" x2="9" y2="2" stroke="var(--ink-700)" strokeWidth="1.5" />
              <line x1="7" y1="14" x2="12" y2="14" stroke="var(--ink-700)" strokeWidth="1.5" />
            </g>,
          ].map((icon, i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16">{icon}</svg>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, letterSpacing: 0.4 }}>
          {wordCount} words
        </div>

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            background: 'var(--terra-200)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="3" fill="var(--bg-paper)" />
          </svg>
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}

function getMoodDot(mood) {
  const dots = { calm: '#9CA888', tender: '#D8A892', restless: '#B89678', warm: '#B8896C', hopeful: '#C9B080', heavy: '#8B7E6E' }
  return dots[mood] || 'var(--ink-300)'
}
