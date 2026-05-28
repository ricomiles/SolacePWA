import { useState, useEffect } from 'react'

const STORAGE_KEY = 'solace_theme'

export const THEMES = [
  { id: 'sand',     label: 'Sand',     bg: '#FAF5EC', accent: '#D4A88C' },
  { id: 'sage',     label: 'Sage',     bg: '#F4F7F0', accent: '#8AAA70' },
  { id: 'dusk',     label: 'Dusk',     bg: '#FAF5F8', accent: '#B89CC8' },
  { id: 'slate',    label: 'Slate',    bg: '#F3F6FB', accent: '#7AACC8' },
  { id: 'rose',     label: 'Rose',     bg: '#FAF4F2', accent: '#C88880' },
  { id: 'petal',    label: 'Petal',    bg: '#FBF4F8', accent: '#D07898' },
  { id: 'midnight', label: 'Midnight', bg: '#242018', accent: '#9E8660' },
]

export function useTheme() {
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || 'sand'
  )

  useEffect(() => {
    if (theme === 'sand') {
      delete document.documentElement.dataset.theme
    } else {
      document.documentElement.dataset.theme = theme
    }
    const themeColors = {
      sand:     '#3A332B',
      sage:     '#2A3324',
      dusk:     '#32283C',
      slate:    '#24303E',
      rose:     '#3C2A28',
      petal:    '#3A2430',
      midnight: '#1C1A16',
    }
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.content = themeColors[theme] ?? themeColors.sand
  }, [theme])

  const setTheme = (id) => {
    setThemeState(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  return { theme, setTheme }
}
