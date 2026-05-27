import { useNavigate, useLocation } from 'react-router-dom'

const TABS = [
  { label: 'Today', path: '/home' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Write', path: '/new', primary: true },
  { label: 'Search', path: '/search' },
  { label: 'You', path: '/settings' },
]

export default function TabBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div
      className="mobile-only"
      style={{
        flexShrink: 0,
        padding: '8px 16px 24px',
        background: 'var(--bg-warm)',
      }}
    >
      <div
        style={{
          height: 56,
          background: 'var(--bg-paper)',
          borderRadius: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          boxShadow: '0 4px 16px rgba(58,51,43,0.08)',
        }}
      >
        {TABS.map((tab) => {
          const active = location.pathname === tab.path
          if (tab.primary) {
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: 'var(--ink-900)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {/* Pen icon */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 12L11 3l3 3-9 9H2v-3z"
                    stroke="#FAF5EC"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </button>
            )
          }
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--sans)',
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                color: active ? 'var(--ink-900)' : 'var(--ink-500)',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 8,
                flexShrink: 0,
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
