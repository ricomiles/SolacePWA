import { useNavigate, useLocation } from 'react-router-dom'
import { SolaceLogoInline } from './SolaceLogo'

const NAV = [
  {
    label: 'Today',
    path: '/home',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 2v3M11 2v3M2 7h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'Calendar',
    path: '/calendar',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="9" r="5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M8 7v2.5l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M5 2v2M11 2v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: 'You',
    path: '/settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.5 13.5c0-3 2.5-4.5 5.5-4.5s5.5 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function AppLayout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <>
      {/* Sidebar — visible tablet+ only via CSS */}
      <aside className="app-sidebar">
        <div className="app-sidebar-logo">
          <SolaceLogoInline size={22} />
        </div>

        <nav className="app-sidebar-nav">
          {NAV.map((item) => (
            <button
              key={item.path}
              className={`app-sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <button
          className="app-sidebar-new"
          onClick={() => navigate('/new')}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1.5 10.5L10 2l2.5 2.5-8.5 8.5H1.5v-2.5z" stroke="#FAF5EC" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
          </svg>
          New entry
        </button>
      </aside>

      {/* Page content */}
      <div className="app-content">
        {children}
      </div>
    </>
  )
}
