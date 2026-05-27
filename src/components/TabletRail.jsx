import { useNavigate, useLocation } from 'react-router-dom'
import SolaceMark from './SolaceLogo'
import { useAuth } from '../hooks/useAuth'

const ITEMS = [
  {
    key: 'today',
    path: '/home',
    label: 'Today',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="3" y="5" width="14" height="12" rx="2" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} />
        <path d="M7 3v3M13 3v3M3 9h14" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'calendar',
    path: '/calendar',
    label: 'Calendar',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="4" width="16" height="14" rx="2.5" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} />
        <path d="M2 8h16" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" />
        <path d="M7 2v3M13 2v3" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" />
        <rect x="6" y="11" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    key: 'settings',
    path: '/settings',
    label: 'You',
    icon: (active) => (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="7.5" r="3" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} />
        <path d="M3.5 17.5c0-3.5 2.9-5.5 6.5-5.5s6.5 2 6.5 5.5" stroke="currentColor" strokeWidth={active ? 1.8 : 1.5} strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function TabletRail() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const initial = user?.email?.[0]?.toUpperCase() || 'S'

  function isActive(item) {
    if (item.path === '/home') {
      return (
        location.pathname === '/home' ||
        location.pathname.startsWith('/entry/') ||
        location.pathname === '/new' ||
        location.pathname.startsWith('/edit/')
      )
    }
    return location.pathname === item.path
  }

  return (
    <div style={{
      width: 72, height: '100%', background: 'var(--bg-cream)',
      borderRight: '1px solid var(--hairline)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '14px 0 18px', flexShrink: 0,
    }}>
      {/* Logo mark only */}
      <div style={{ padding: '6px 0 18px' }}>
        <SolaceMark size={32} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
        {ITEMS.map(item => {
          const active = isActive(item)
          return (
            <button
              key={item.key}
              onClick={() => navigate(item.path)}
              style={{
                width: 52, padding: '8px 0', borderRadius: 12, border: 'none',
                background: active ? 'var(--terra-100)' : 'transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                fontFamily: 'var(--sans)', fontWeight: active ? 700 : 500,
                color: active ? 'var(--ink-900)' : 'var(--ink-500)',
                cursor: 'pointer', transition: 'background 0.12s',
              }}
            >
              {item.icon(active)}
              <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* Avatar → settings */}
      <button
        onClick={() => navigate('/settings')}
        style={{
          width: 38, height: 38, borderRadius: 19, background: 'var(--terra-200)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17,
          color: 'var(--bg-paper)', fontWeight: 500,
        }}
      >{initial}</button>
    </div>
  )
}
