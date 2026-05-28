import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Fuse from 'fuse.js'
import { useEntries } from '../hooks/useEntries'
import { useBreakpoint } from '../hooks/useBreakpoint'
import EntryCard from '../components/EntryCard'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

function useSearch(entries) {
  const [query, setQuery] = useState('')

  const fuse = useMemo(() => new Fuse(entries, {
    keys: [
      { name: 'title', weight: 2 },
      { name: 'body', weight: 1 },
      { name: 'mood', weight: 0.5 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  }), [entries])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    return fuse.search(q).map(r => r.item)
  }, [fuse, query])

  return { query, setQuery, results }
}

// ── Mobile / tablet portrait ───────────────────────────────────────────────────
function MobileSearch() {
  const navigate = useNavigate()
  const { entries, loading } = useEntries()
  const { query, setQuery, results } = useSearch(entries)
  const inputRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  const { isTabletPortrait: t } = useBreakpoint()

  return (
    <div style={{ flex: 1, background: 'var(--bg-paper)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />

      {/* Search bar */}
      <div style={{ padding: t ? '28px 48px 0' : '20px 20px 0', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', padding: '4px 0', cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M13 4L7 10l6 6" stroke="var(--ink-700)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--terra-50)', borderRadius: 16,
          padding: t ? '14px 20px' : '12px 16px',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--ink-400)" strokeWidth="1.4" />
            <path d="M10 10l3.5 3.5" stroke="var(--ink-400)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your journal…"
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'var(--serif)', fontSize: t ? 20 : 16, color: 'var(--ink-900)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="var(--ink-400)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="page-scroll" style={{ flex: 1, padding: t ? '24px 48px 80px' : '20px 20px 80px' }}>
        {loading ? (
          <div style={{ paddingTop: 60, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-400)' }}>
            Loading…
          </div>
        ) : !query.trim() ? (
          <div style={{ paddingTop: 60, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: t ? 22 : 18, color: 'var(--ink-500)', fontStyle: 'italic', lineHeight: 1.5 }}>
              Your entries are searched<br />locally, never on the server.
            </div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ paddingTop: 60, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: t ? 22 : 18, color: 'var(--ink-500)', fontStyle: 'italic' }}>
              Nothing matched.
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-400)', marginTop: 8 }}>
              Try a different word or phrase.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: 1.6, color: 'var(--ink-400)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </div>
            {results.map((entry, i) => (
              <EntryCard key={entry.id} entry={entry} variant="list" first={i === 0} />
            ))}
          </>
        )}
      </div>

      <HomeIndicator />
    </div>
  )
}

// ── Desktop / tablet landscape ─────────────────────────────────────────────────
function DesktopSearch() {
  const { entries, loading } = useEntries()
  const { query, setQuery, results } = useSearch(entries)
  const inputRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{ flex: 1, background: 'var(--bg-paper)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Search bar */}
      <div style={{ padding: '32px 48px 0', flexShrink: 0, borderBottom: '1px solid var(--hairline)', paddingBottom: 24 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'var(--terra-50)', borderRadius: 14,
          padding: '14px 20px',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="var(--ink-400)" strokeWidth="1.4" />
            <path d="M10 10l3.5 3.5" stroke="var(--ink-400)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search your journal…"
            style={{
              flex: 1, border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'var(--serif)', fontSize: 18, color: 'var(--ink-900)',
            }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="var(--ink-400)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div style={{ flex: 1, overflow: 'auto', padding: '28px 48px 48px' }}>
        {loading ? (
          <div style={{ paddingTop: 60, textAlign: 'center', fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16, color: 'var(--ink-400)' }}>
            Loading…
          </div>
        ) : !query.trim() ? (
          <div style={{ paddingTop: 60, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink-500)', fontStyle: 'italic', lineHeight: 1.5 }}>
              Your entries are searched<br />locally, never on the server.
            </div>
          </div>
        ) : results.length === 0 ? (
          <div style={{ paddingTop: 60, textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--serif)', fontSize: 20, color: 'var(--ink-500)', fontStyle: 'italic' }}>
              Nothing matched.
            </div>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-400)', marginTop: 8 }}>
              Try a different word or phrase.
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: 1.6, color: 'var(--ink-400)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 20 }}>
              {results.length} {results.length === 1 ? 'result' : 'results'}
            </div>
            <div style={{ maxWidth: 680 }}>
              {results.map((entry, i) => (
                <EntryCard key={entry.id} entry={entry} variant="list" first={i === 0} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Search() {
  const bp = useBreakpoint()
  if (bp.showEntriesPanel) return <DesktopSearch />
  return <MobileSearch />
}
