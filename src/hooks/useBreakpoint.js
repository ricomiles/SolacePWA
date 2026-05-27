import { useState, useEffect } from 'react'

export function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 375,
  )

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return {
    isMobile: width < 768,
    isTabletPortrait: width >= 768 && width <= 1024,  // includes iPad Pro portrait (1024px)
    isTabletLandscape: width > 1024 && width < 1280,
    isDesktop: width >= 1280,
    // true on tablet landscape and desktop (not at exactly 1024 — iPad Pro portrait)
    showEntriesPanel: width > 1024,
    showFullSidebar: width >= 1280,
    // tablet portrait only gets a top nav bar
    showTopNav: width >= 768 && width <= 1024,
  }
}
