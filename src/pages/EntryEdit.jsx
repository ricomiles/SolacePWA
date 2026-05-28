import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'
import { getKey } from '../store/cryptoStore'
import { decrypt } from '../crypto'
import { useEntries } from '../hooks/useEntries'
import { useBreakpoint } from '../hooks/useBreakpoint'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import RichTextEditor from '../components/RichTextEditor'
import FormattingToolbar from '../components/FormattingToolbar'

const AUTO_SAVE_INTERVAL = 2000

function PromptBanner({ prompt }) {
  const [dismissed, setDismissed] = useState(false)
  if (!prompt || dismissed) return null
  return (
    <div style={{
      padding: '20px 22px', background: 'var(--bg-paper)', borderRadius: 20,
      border: '1px solid var(--hairline)', marginBottom: 20, position: 'relative',
    }}>
      <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700, marginBottom: 12 }}>
        Prompt
      </div>
      <div style={{ fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 18, lineHeight: 1.3, letterSpacing: '-0.015em', color: 'var(--ink-900)' }}>
        {prompt}
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--ink-300)', lineHeight: 1 }}
        aria-label="Dismiss prompt"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  )
}

const MOOD_COLORS = {
  calm: '#9CA888', tender: '#D8A892', restless: '#B89678',
  warm: '#B8896C', hopeful: '#C9B080', heavy: '#8B7E6E',
}

function getMoodDot(mood) {
  return MOOD_COLORS[mood] || 'var(--ink-300)'
}

function useEditorState(id) {
  const { updateEntry } = useEntries()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [mood, setMood] = useState(null)
  const [prompt, setPrompt] = useState(null)
  const [savedAt, setSavedAt] = useState(null)
  const [saving, setSaving] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const [loaded, setLoaded] = useState(false)

  const autoSaveTimer = useRef(null)
  const isDirtyRef = useRef(false)

  const rawEntry = useLiveQuery(() => db.entries.get(id), [id])

  useEffect(() => {
    if (!rawEntry || loaded) return
    const key = getKey()
    if (!key) return
    decrypt(key, rawEntry.ciphertext, rawEntry.iv)
      .then(plaintext => {
        const parsed = JSON.parse(plaintext)
        setTitle(parsed.title || '')
        setBody(parsed.body || '')
        setMood(parsed.mood || null)
        setPrompt(parsed.prompt || null)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [rawEntry, loaded])

  useEffect(() => {
    const plain = body.replace(/<[^>]+>/g, ' ')
    setWordCount(plain.trim().split(/\s+/).filter(Boolean).length)
  }, [body])

  const doSave = useCallback(async () => {
    if (!isDirtyRef.current || !loaded) return
    setSaving(true)
    try {
      await updateEntry(id, { title, body, mood, prompt })
      setSavedAt(new Date())
      isDirtyRef.current = false
    } catch {
      // Silently fail
    } finally {
      setSaving(false)
    }
  }, [id, title, body, mood, updateEntry, loaded])

  useEffect(() => {
    if (!loaded) return
    isDirtyRef.current = true
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(doSave, AUTO_SAVE_INTERVAL)
    return () => clearTimeout(autoSaveTimer.current)
  }, [title, body, mood, loaded]) // eslint-disable-line react-hooks/exhaustive-deps

  const savedLabel = savedAt
    ? `saved · ${Math.round((Date.now() - savedAt.getTime()) / 60000) || '<1'}m ago`
    : saving ? 'saving…' : 'unsaved'

  return { title, setTitle, body, setBody, mood, setMood, prompt, saving, savedLabel, wordCount, doSave, autoSaveTimer, loaded }
}

// ── Desktop / iPad landscape editing pane ─────────────────────────────────────
function DesktopEditPane({ id }) {
  const navigate = useNavigate()
  const { title, setTitle, body, setBody, mood, prompt, saving, savedLabel, wordCount, doSave, autoSaveTimer, loaded } = useEditorState(id)
  const [focusMode, setFocusMode] = useState(false)
  const [editor, setEditor] = useState(null)

  const now = new Date()
  const wd = now.toLocaleString('en', { weekday: 'short' })
  const day = now.getDate()
  const month = now.toLocaleString('en', { month: 'long' })
  const year = now.getFullYear()

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
    navigate(`/entry/${id}`)
  }

  if (!loaded) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-paper)' }}>
        <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', color: 'var(--ink-500)', fontSize: 16 }}>Loading…</div>
      </div>
    )
  }

  return (
    <div style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-paper)', overflow: 'hidden', position: 'relative' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FormattingToolbar editor={editor} size={30} />
            {mood && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, marginLeft: 4 }}>
                <span style={{ width: 1, height: 14, background: 'var(--hairline-strong)', display: 'inline-block' }} />
                <span style={{ width: 6, height: 6, borderRadius: 3, background: getMoodDot(mood) }} />
                <span>{mood}</span>
              </div>
            )}
            <button
              onClick={() => setFocusMode(true)}
              style={{ padding: '4px 10px', borderRadius: 6, background: 'rgba(58,51,43,0.05)', fontWeight: 600, color: 'var(--ink-700)', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 11, marginLeft: 4 }}
            >⌘. Focus</button>
            <button
              onClick={handleDone}
              style={{ padding: '5px 14px', borderRadius: 6, background: 'var(--ink-900)', color: 'var(--bg-paper)', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 12, fontWeight: 600 }}
            >Done</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflow: 'auto', padding: focusMode ? '120px 96px 96px' : '64px 96px 64px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, marginBottom: 14 }}>
            {wd} · {day} {month} {year}
          </div>
          {!focusMode && <PromptBanner prompt={prompt} />}
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title…"
            style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', fontFamily: 'var(--serif)', fontWeight: 400, fontSize: 44, lineHeight: 1.1, letterSpacing: '-0.02em', color: 'var(--ink-900)', padding: 0, margin: '0 0 28px', display: 'block' }}
          />

          {loaded && (
            <RichTextEditor
              initialContent={body}
              onChange={setBody}
              onEditorReady={setEditor}
              placeholder="Continue writing…"
              style={{
                fontFamily: 'var(--serif)', fontSize: 19, lineHeight: 1.75,
                color: 'var(--ink-700)', letterSpacing: '-0.005em', minHeight: 400,
              }}
            />
          )}
        </div>
      </div>

      {focusMode && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 16, padding: '8px 16px',
          background: 'rgba(244,236,224,0.92)', backdropFilter: 'blur(20px)',
          border: '1px solid var(--hairline)', borderRadius: 999,
          fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', fontWeight: 600,
          boxShadow: '0 4px 24px rgba(58,51,43,0.10)', whiteSpace: 'nowrap',
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
            style={{ padding: '3px 10px', borderRadius: 6, background: 'rgba(58,51,43,0.06)', color: 'var(--ink-700)', border: 'none', cursor: 'pointer', fontFamily: 'var(--sans)', fontSize: 11, fontWeight: 600 }}
          >⌘. Exit focus</button>
        </div>
      )}
    </div>
  )
}

// ── Mobile editing view ────────────────────────────────────────────────────────
function MobileEditView({ id }) {
  const navigate = useNavigate()
  const { title, setTitle, body, setBody, mood, prompt, saving, savedLabel, wordCount, doSave, autoSaveTimer, loaded } = useEditorState(id)
  const { isTabletPortrait: t } = useBreakpoint()
  const [editor, setEditor] = useState(null)

  const now = new Date()
  const dateLabel = now.toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()
  const hour = now.getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'

  const handleDone = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    await doSave()
    navigate(-1)
  }

  const handleClose = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    doSave().finally(() => navigate(-1))
  }

  return (
    <div style={{ flex: 1, background: 'var(--bg-paper)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      {/* Top bar */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: t ? '28px 56px 12px' : '20px 24px 10px' }}>
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

        {/* Formatting strip */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: t ? '4px 48px 4px 48px' : '4px 16px 4px 16px',
          borderTop: '1px solid var(--hairline)', borderBottom: '1px solid var(--hairline)',
        }}>
          <FormattingToolbar editor={editor} size={36} />
          <div style={{ flex: 1 }} />
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, color: 'var(--ink-500)', fontWeight: 600, letterSpacing: 0.4 }}>
            {wordCount} words
          </div>
        </div>
      </div>

      <div className="page-scroll" style={{ flex: 1, padding: t ? '52px 72px 80px' : '36px 32px 80px' }}>
        <div style={{ maxWidth: t ? 720 : undefined, margin: t ? '0 auto' : undefined }}>
        <div style={{ fontFamily: 'var(--sans)', fontSize: t ? 13 : 11, letterSpacing: 2, color: 'var(--ink-500)', textTransform: 'uppercase', fontWeight: 700, marginBottom: t ? 22 : 14 }}>
          {dateLabel} · {timeOfDay}
        </div>
        <PromptBanner prompt={prompt} />
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title…"
          style={{ width: '100%', border: 'none', background: 'transparent', fontFamily: 'var(--serif)', fontWeight: 400, fontSize: t ? 50 : 30, lineHeight: 1.1, letterSpacing: -0.5, color: 'var(--ink-900)', padding: 0, outline: 'none', marginBottom: t ? 22 : 14 }}
        />
        {mood && (
          <div style={{ display: 'flex', gap: 8, marginBottom: t ? 32 : 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: t ? '10px 18px' : '6px 12px', background: 'var(--sage-100)', borderRadius: 999, fontFamily: 'var(--sans)', fontSize: t ? 16 : 12, color: 'var(--ink-700)', fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: getMoodDot(mood) }} />
              {mood}
            </div>
          </div>
        )}
        {loaded && (
          <RichTextEditor
            initialContent={body}
            onChange={setBody}
            onEditorReady={setEditor}
            placeholder="Continue writing…"
            style={{
              fontFamily: 'var(--serif)', fontSize: t ? 24 : 18, lineHeight: 1.75,
              color: 'var(--ink-700)', letterSpacing: -0.1, minHeight: 300,
            }}
          />
        )}
        </div>
      </div>

      <HomeIndicator />
    </div>
  )
}

export default function EntryEdit() {
  const { id } = useParams()
  const bp = useBreakpoint()

  if (bp.showEntriesPanel) return <DesktopEditPane id={id} />
  return <MobileEditView id={id} />
}
