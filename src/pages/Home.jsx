import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useEntries } from '../hooks/useEntries'
import { useSync } from '../hooks/useSync'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import TabBar from '../components/TabBar'
import EntryCard from '../components/EntryCard'
import OfflineBanner from '../components/OfflineBanner'
import IOSInstallBanner from '../components/IOSInstallBanner'

const FILTERS = ['Days', 'Weeks', 'Months']

export default function Home() {
  const navigate = useNavigate()
  const { entries, loading } = useEntries()
  const { syncing, pendingCount } = useSync()
  const [activeFilter, setActiveFilter] = useState(0)

  const now = new Date()
  const monthName = now.toLocaleString('en', { month: 'long' })

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--bg-warm)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusBar />
      <OfflineBanner />

      {/* Header */}
      <div
        style={{
          padding: '42px 28px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexShrink: 0,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 13,
              fontStyle: 'italic',
              color: 'var(--ink-500)',
            }}
          >
            — the daybook —
          </div>
          <h1
            style={{
              fontFamily: 'var(--serif)',
              fontSize: 38,
              fontWeight: 400,
              letterSpacing: -0.6,
              margin: '6px 0 0',
              lineHeight: 1,
              color: 'var(--ink-900)',
            }}
          >
            {monthName}
            <span style={{ color: 'var(--terra-300)' }}>.</span>
          </h1>
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 13,
            fontStyle: 'italic',
            color: 'var(--ink-500)',
            textAlign: 'right',
          }}
        >
          {syncing ? 'syncing…' : pendingCount > 0 ? `${pendingCount} pending` : ''}
        </div>
      </div>

      {/* Filter pills */}
      <div
        style={{
          padding: '0 28px 8px',
          display: 'flex',
          gap: 6,
          flexShrink: 0,
        }}
      >
        {FILTERS.map((filter, i) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(i)}
            style={{
              padding: '6px 14px',
              borderRadius: 999,
              fontFamily: 'var(--sans)',
              fontSize: 12,
              fontWeight: 600,
              background: activeFilter === i ? 'var(--ink-900)' : 'transparent',
              color: activeFilter === i ? 'var(--bg-paper)' : 'var(--ink-500)',
              border: activeFilter === i ? 'none' : '1px solid var(--hairline-strong)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Timeline list */}
      <div
        className="page-scroll"
        style={{
          flex: 1,
          padding: '20px 28px 100px',
          position: 'relative',
        }}
      >
        {/* Vertical timeline line */}
        {entries.length > 0 && (
          <div
            style={{
              position: 'absolute',
              left: 64,
              top: 28,
              bottom: 40,
              width: 1,
              background: 'var(--hairline-strong)',
              pointerEvents: 'none',
            }}
          />
        )}

        {loading ? (
          <div
            style={{
              padding: '60px 0',
              textAlign: 'center',
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              color: 'var(--ink-500)',
              fontSize: 16,
            }}
          >
            Loading your journal…
          </div>
        ) : entries.length === 0 ? (
          <div
            style={{
              padding: '60px 0',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 22,
                fontWeight: 400,
                color: 'var(--ink-900)',
                marginBottom: 12,
              }}
            >
              Your journal is empty.
            </div>
            <p
              style={{
                fontFamily: 'var(--serif)',
                fontStyle: 'italic',
                fontSize: 15,
                color: 'var(--ink-500)',
                marginBottom: 28,
              }}
            >
              Begin with today's entry.
            </p>
            <button
              onClick={() => navigate('/new')}
              style={{
                padding: '14px 28px',
                background: 'var(--ink-900)',
                color: 'var(--bg-paper)',
                border: 'none',
                borderRadius: 999,
                fontFamily: 'var(--sans)',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Write first entry
            </button>
          </div>
        ) : (
          entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))
        )}
      </div>

      {/* FAB write button */}
      <button
        onClick={() => navigate('/new')}
        style={{
          position: 'fixed',
          right: 24,
          bottom: 100,
          width: 60,
          height: 60,
          borderRadius: 30,
          background: 'var(--ink-900)',
          color: 'var(--bg-paper)',
          border: 'none',
          boxShadow: '0 8px 24px rgba(58,51,43,0.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
          cursor: 'pointer',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
          <path
            d="M3 16.5L15.5 4l3.5 3.5L6.5 20H3v-3.5z"
            stroke="#FAF5EC"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </button>

      <TabBar />
      <IOSInstallBanner />
      <HomeIndicator />
    </div>
  )
}
