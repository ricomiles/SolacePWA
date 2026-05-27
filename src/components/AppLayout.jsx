import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint'
import { useAuth } from '../hooks/useAuth'
import { SolaceLogoInline } from './SolaceLogo'
import DesktopSidebar from './DesktopSidebar'
import TabletRail from './TabletRail'
import EntriesPanel from './EntriesPanel'

// Routes where the entries panel is shown on tablet landscape + desktop
function wantsEntriesPanel(pathname) {
  return (
    pathname === '/home' ||
    pathname === '/new' ||
    pathname.startsWith('/entry/') ||
    pathname.startsWith('/edit/')
  )
}

// Slim top bar for iPad portrait (768–1023px)
function TabletTopNav() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const initial = user?.email?.[0]?.toUpperCase() || 'S'

  return (
    <div style={{
      height: 52, background: 'var(--bg-cream)', borderBottom: '1px solid var(--hairline)',
      display: 'flex', alignItems: 'center', padding: '0 28px', flexShrink: 0,
    }}>
      <SolaceLogoInline size={16} />
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          onClick={() => navigate('/calendar')}
          title="Calendar"
          style={{
            width: 34, height: 34, borderRadius: 17, background: 'var(--bg-warm)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="4" width="12" height="10" rx="2" stroke="var(--ink-700)" strokeWidth="1.4" />
            <path d="M5 2v3M11 2v3M2 7h12" stroke="var(--ink-700)" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </button>
        <button
          onClick={() => navigate('/home')}
          title="New entry"
          style={{
            width: 34, height: 34, borderRadius: 17, background: 'var(--ink-900)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1.5 10.5L9 3l2.5 2.5-7.5 7.5H1.5v-2.5z" stroke="var(--bg-paper)" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={() => navigate('/settings')}
          style={{
            width: 34, height: 34, borderRadius: 17, background: 'var(--terra-200)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 16,
            color: 'var(--bg-paper)', fontWeight: 500,
          }}
        >{initial}</button>
      </div>
    </div>
  )
}

export default function AppLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const bp = useBreakpoint()

  // Global keyboard shortcuts on desktop/landscape
  useEffect(() => {
    if (!bp.showEntriesPanel) return
    const handler = e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault()
        navigate('/new')
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [bp.showEntriesPanel, navigate])

  // ── Desktop ≥ 1280px ──────────────────────────────────────────────────────
  if (bp.isDesktop) {
    const withEntries = wantsEntriesPanel(location.pathname)
    return (
      <div style={{
        display: 'flex', height: '100%', width: '100%',
        overflow: 'hidden', flex: 1,
      }}>
        <DesktopSidebar />
        {withEntries && <EntriesPanel width={360} />}
        <div style={{
          flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--bg-paper)',
        }}>
          {children}
        </div>
      </div>
    )
  }

  // ── iPad landscape 1024–1279px ────────────────────────────────────────────
  if (bp.isTabletLandscape) {
    const withEntries = wantsEntriesPanel(location.pathname)
    return (
      <div style={{
        display: 'flex', height: '100%', width: '100%',
        overflow: 'hidden', flex: 1,
      }}>
        <TabletRail />
        {withEntries && <EntriesPanel width={320} />}
        <div style={{
          flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', background: 'var(--bg-paper)',
        }}>
          {children}
        </div>
      </div>
    )
  }

  // ── iPad portrait 768–1023px ──────────────────────────────────────────────
  if (bp.isTabletPortrait) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', height: '100%',
        width: '100%', overflow: 'hidden', flex: 1, background: 'var(--bg-paper)',
      }}>
        <TabletTopNav />
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    )
  }

  // ── Mobile < 768px ────────────────────────────────────────────────────────
  // Pages handle their own full-screen mobile layout
  return <>{children}</>
}
