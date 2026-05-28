import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useEntries } from '../hooks/useEntries'
import { useBreakpoint } from '../hooks/useBreakpoint'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import { getDailyPrompt } from '../data/prompts'

const AUTO_SAVE_INTERVAL = 2000

const MOOD_COLORS = {
  calm: '#9CA888',
  tender: '#D8A892',
  restless: '#B89678',
  warm: '#B8896C',
  hopeful: '#C9B080',
  heavy: '#8B7E6E',
}

function getMoodDot(mood, moodColor) {
  if (moodColor) return moodColor
  return MOOD_COLORS[mood] || 'var(--ink-300)'
}

function useEntryWriter() {
  const location = useLocation()
  const initialMood = location.state?.mood || null
  const initialMoodColor = location.state?.moodColor || null
  const initialPrompt = location.state?.promptText || null
  const { createEntry } = useEntries()

  const [title, setTitle] = useState(location.state?.title || '')
  const [body, setBody] = useState(location.state?.body || '')
  const [mood, setMood] = useState(initialMood)
  const [moodColor, setMoodColor] = useState(initialMoodColor)
  const [savedAt, setSavedAt] = useState(null)
  const [saving, setSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const prompt = initialPrompt

  const autoSaveTimer = useRef(null)
  const isDirtyRef = useRef(false)
  // Use refs so doSave always reads the latest value without stale closures
  const entryIdRef = useRef(location.state?.entryId || null)
  const isCreatingRef = useRef(false)

  useEffect(() => {
    setWordCount(body.trim().split(/\s+/).filter(Boolean).length)
  }, [body])

  const doSave = useCallback(async () => {
    if (!isDirtyRef.current) return
    if (isCreatingRef.current) return
    setSaving(true)
    try {
      if (!entryIdRef.current) {
        isCreatingRef.current = true
        const entry = await createEntry({ title, body, mood, moodColor, prompt })
        entryIdRef.current = entry.id
        isCreatingRef.current = false
      }
      setSavedAt(new Date())
      isDirtyRef.current = false
    } catch {
      isCreatingRef.current = false
      // Silently fail — never log content
    } finally {
      setSaving(false)
    }
  }, [title, body, mood, moodColor, createEntry])

  useEffect(() => {
    isDirtyRef.current = true
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(doSave, AUTO_SAVE_INTERVAL)
    return () => clearTimeout(autoSaveTimer.current)
  }, [title, body, mood, moodColor]) // eslint-disable-line react-hooks/exhaustive-deps

  const savedLabel = savedAt
    ? `saved · ${Math.round((Date.now() - savedAt.getTime()) / 60000) || '<1'}m ago`
    : saving ? 'saving…' : 'unsaved'

  return { title, setTitle, body, setBody, mood, setMood, moodColor, setMoodColor, prompt, saving, savedAt, savedLabel, wordCount, doSave, entryIdRef, autoSaveTimer }
}

// ── Daily prompt banner ───────────────────────────────────────────────────────
function PromptBanner({ compact = false }) {
  const location = useLocation()
  const [dismissed, setDismissed] = useState(false)
  const prompt = getDailyPrompt()
  const hour = new Date().getHours()
  const timeLabel = hour < 12 ? 'Morning' : hour < 17 ? 'Afternoon' : 'Tonight'

  if (!location.state?.showPrompt || dismissed) return null

  return (
    <div style={{
      padding: compact ? '20px 22px' : '24px 22px',
      background: 'var(--bg-paper)', borderRadius: 20,
      border: '1px solid var(--hairline)',
      marginBottom: compact ? 20 : 24,
      position: 'relative',
    }}>
      <div style={{
        fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em',
        textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700,
        marginBottom: 12,
      }}>
        {timeLabel}'s prompt
      </div>
      <div style={{
        fontFamily: 'var(--serif)', fontWeight: 400,
        fontSize: compact ? 18 : 22, lineHeight: 1.3,
        letterSpacing: '-0.015em', color: 'var(--ink-900)',
      }}>
        {prompt}
      </div>
      <button
        onClick={e => { e.stopPropagation(); setDismissed(true) }}
        style={{
          position: 'absolute', top: 14, right: 14,
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          color: 'var(--ink-300)', lineHeight: 1,
        }}
        aria-label="Dismiss prompt"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

// ── Desktop / iPad landscape writing pane ─────────────────────────────────────
function DesktopWritingPane() {
  const navigate = useNavigate()
  const bp = useBreakpoint()
  const { title, setTitle, body, setBody, mood, setMood, moodColor, setMoodColor, prompt, saving, savedLabel, wordCount, doSave, entryIdRef, autoSaveTimer } = useEntryWriter()
  const [focusMode, setFocusMode] = useState(false)

  const now = new Date()
  const wd = now.toLocaleString('en', { weekday: 'short' })
  const day = now.getDate()
  const month = now.toLocaleString('en', { month: 'long' })
  const year = now.getFullYear()

  // ⌘. focus mode, ⌘S force save
  useEffect(() => {
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault()
        setFocusMode(f => !f)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleDone = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    await doSave()
    navigate('/home')
  }

  return (
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-paper)', overflow: 'hidden', position: 'relative' }}>
      {/* Top bar — hidden in focus mode */}
      {!focusMode && (
        <div style={{
          height: 44, display: 'flex', alignItems: 'center', padding: '0 24px',
          borderBottom: '1px solid var(--hairline)', gap: 12, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--terra-400)', fontWeight: 700, letterSpacing: '0.13em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: saving ? 'var(--terra-200)' : 'var(--terra-300)' }} />
            {savedLabel}
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', fontWeight: 500 }}>
            <span>{wordCount} words</span>
            {mood && (
              <>
                <span>·</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: getMoodDot(mood, moodColor) }} />
                  {mood}
                </span>
              </>
            )}
            <button
              onClick={() => setFocusMode(true)}
              title="⌘."
              style={{
                padding: '4px 10px', borderRadius: 6, background: 'rgba(58,51,43,0.05)',
                fontWeight: 600, color: 'var(--ink-700)', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: 11,
              }}
            >⌘. Focus</button>
            <button
              onClick={handleDone}
              style={{
                padding: '5px 14px', borderRadius: 6, background: 'var(--ink-900)',
                color: 'var(--bg-paper)', border: 'none', cursor: 'pointer',
                fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600,
              }}
            >Done</button>
          </div>
        </div>
      )}

      {/* Writing area */}
      <div style={{ flex: 1, overflow: 'auto', padding: focusMode ? '120px 96px 96px' : '64px 96px 64px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 14 }}>
            {wd} · {day} {month} {year}
          </div>

          {!focusMode && <PromptBanner compact />}

          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Give this entry a title…"
            style={{
              width: '100%', border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 44, lineHeight: 1.1,
              letterSpacing: '-0.02em', color: 'var(--ink-900)', padding: 0, margin: '0 0 24px',
              display: 'block',
            }}
          />

          {/* Mood pill — hidden when mood tracking is disabled */}
          {localStorage.getItem('solace_mood_tracking') !== 'false' && <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
            <button
              onClick={() => navigate('/mood', { state: { returnTo: '/new', title, body, entryId: entryIdRef.current, showPrompt: !!prompt, promptText: prompt } })}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                background: mood ? 'var(--sage-100)' : 'transparent',
                border: mood ? 'none' : '1px dashed var(--hairline-strong)',
                borderRadius: 999, fontFamily: 'var(--sans)', fontSize: 12,
                color: mood ? 'var(--ink-700)' : 'var(--ink-500)', fontWeight: 600, cursor: 'pointer',
              }}
            >
              {mood ? (
                <>
                  <span style={{ width: 6, height: 6, borderRadius: 3, background: getMoodDot(mood, moodColor) }} />
                  {mood}
                </>
              ) : '+ mood'}
            </button>
          </div>}

          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Begin writing here…"
            autoFocus
            style={{
              width: '100%', border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75, color: 'var(--ink-700)',
              padding: 0, letterSpacing: '-0.005em', minHeight: 400, resize: 'none',
              display: 'block',
            }}
          />
        </div>
      </div>

      {/* Focus mode floating chip */}
      {focusMode && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 16, padding: '8px 16px',
          background: 'rgba(244,236,224,0.92)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--hairline)', borderRadius: 999,
          fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', fontWeight: 600,
          boxShadow: '0 4px 24px rgba(58,51,43,0.10)',
          whiteSpace: 'nowrap',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: 3, background: saving ? 'var(--terra-200)' : 'var(--terra-300)' }} />
            {savedLabel}
          </span>
          <span style={{ width: 1, height: 16, background: 'var(--hairline)' }} />
          <span>{wordCount} words</span>
          <span style={{ width: 1, height: 16, background: 'var(--hairline)' }} />
          <button
            onClick={() => setFocusMode(false)}
            style={{
              padding: '3px 10px', borderRadius: 6, background: 'rgba(58,51,43,0.06)',
              color: 'var(--ink-700)', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600,
            }}
          >⌘. Exit focus</button>
        </div>
      )}
    </div>
  )
}

// ── Mobile writing view ────────────────────────────────────────────────────────
function MobileWritingView() {
  const navigate = useNavigate()
  const { title, setTitle, body, setBody, mood, setMood, moodColor, setMoodColor, prompt, saving, savedLabel, wordCount, doSave, entryIdRef, autoSaveTimer } = useEntryWriter()
  const { isTabletPortrait: t } = useBreakpoint()
  const scrollRef = useRef(null)

  // Prevent iOS from scrolling to the textarea on mount — keep title visible
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [])

  const now = new Date()
  const dateLabel = now.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
  const hour = now.getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  const handleDone = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    await doSave()
    navigate('/home')
  }

  const handleClose = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    doSave().finally(() => navigate('/home'))
  }

  return (
    <div style={{ flex: 1, background: 'var(--bg-paper)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: t ? '28px 56px 0' : '20px 24px 0', flexShrink: 0 }}>
        <button
          onClick={handleClose}
          style={{ background: 'transparent', border: 'none', fontFamily: 'var(--sans)', fontSize: t ? 18 : 14, color: 'var(--ink-500)', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="var(--ink-500)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Close
        </button>

        <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 13 : 11, color: 'var(--terra-400)', fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: saving ? 'var(--terra-200)' : 'var(--terra-300)', display: 'inline-block' }} />
          {savedLabel}
        </div>

        <button
          onClick={handleDone}
          style={{ background: 'transparent', border: 'none', fontFamily: 'var(--sans)', fontSize: t ? 18 : 14, color: 'var(--ink-900)', fontWeight: 600, cursor: 'pointer' }}
        >Done</button>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="page-scroll" style={{ flex: 1, padding: t ? '52px 72px 120px' : '36px 32px 120px' }}>
        <div style={{ maxWidth: t ? 720 : undefined, margin: t ? '0 auto' : undefined }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 13 : 11, letterSpacing: 2, color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 700, marginBottom: t ? 22 : 14 }}>
          {dateLabel} · {timeOfDay}
        </div>

        <PromptBanner />

        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Give this entry a title…"
          style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontWeight: 400, fontSize: t ? 50 : 30, lineHeight: 1.1, letterSpacing: -0.5, color: 'var(--ink-900)', padding: 0, outline: 'none', marginBottom: t ? 22 : 14 }}
        />

        {localStorage.getItem('solace_mood_tracking') !== 'false' && <div style={{ display: 'flex', gap: 8, marginBottom: t ? 32 : 24 }}>
          <button
            onClick={() => navigate('/mood', { state: { returnTo: '/new', title, body, entryId: entryIdRef.current, showPrompt: !!prompt, promptText: prompt } })}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: t ? '10px 18px' : '6px 12px',
              background: mood ? 'var(--sage-100)' : 'transparent',
              border: mood ? 'none' : '1px dashed var(--hairline-strong)',
              borderRadius: 999, fontFamily: 'var(--sans)', fontSize: t ? 16 : 12,
              color: mood ? 'var(--ink-700)' : 'var(--ink-500)', fontWeight: 600, cursor: 'pointer',
            }}
          >
            {mood ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: getMoodDot(mood, moodColor) }} />
                {mood}
              </>
            ) : '+ mood'}
          </button>
        </div>}

        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder="Begin writing here…"
          style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontSize: t ? 24 : 18, lineHeight: 1.75, color: 'var(--ink-700)', padding: 0, outline: 'none', letterSpacing: -0.1, minHeight: 300, resize: 'none' }}
        />
        </div>
      </div>

      {/* Bottom toolbar */}
      <div style={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        width: 'min(calc(100% - 32px), 398px)', padding: '10px 14px',
        background: 'var(--bg-cream)', borderRadius: 999,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(58,51,43,0.06)', zIndex: 30,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            <path key="b" d="M4 2h5a3 3 0 010 6 3 3 0 010 6H4V2z" stroke="var(--ink-700)" strokeWidth="1.5" fill="none" />,
            <g key="i"><line x1="10" y1="2" x2="6" y2="14" stroke="var(--ink-700)" strokeWidth="1.5" /><line x1="4" y1="2" x2="9" y2="2" stroke="var(--ink-700)" strokeWidth="1.5" /><line x1="7" y1="14" x2="12" y2="14" stroke="var(--ink-700)" strokeWidth="1.5" /></g>,
            <g key="q"><path d="M3 6c0-1 1-2 2-2 1 0 2 1 2 2 0 1-1 2-2 2v2M9 6c0-1 1-2 2-2 1 0 2 1 2 2 0 1-1 2-2 2v2" stroke="var(--ink-700)" strokeWidth="1.4" fill="none" strokeLinecap="round" /></g>,
          ].map((icon, i) => (
            <div key={i} style={{ width: 36, height: 36, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 16 16">{icon}</svg>
            </div>
          ))}
        </div>
        <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, letterSpacing: 0.4 }}>
          {wordCount} words
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--terra-200)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="3" fill="var(--bg-paper)" />
            <rect x="6" y="0" width="2" height="14" fill="var(--bg-paper)" />
          </svg>
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}

export default function EntryNew() {
  const bp = useBreakpoint()

  if (bp.showEntriesPanel) return <DesktopWritingPane />
  return <MobileWritingView />
}
