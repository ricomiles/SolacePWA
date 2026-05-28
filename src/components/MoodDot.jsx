const MOOD_COLORS = {
  calm:     { bg: '#DCDDC7', dot: '#9CA888' },
  tender:   { bg: '#E8C4B0', dot: '#D8A892' },
  restless: { bg: '#D9B895', dot: '#B89678' },
  warm:     { bg: '#EDD3BD', dot: '#B8896C' },
  hopeful:  { bg: '#E5D2A8', dot: '#C9B080' },
  heavy:    { bg: '#C9B8A8', dot: '#8B7E6E' },
}

export const MOOD_LIST = Object.entries(MOOD_COLORS).map(([name, colors]) => ({
  name,
  ...colors,
}))

export function getMoodColors(mood) {
  return MOOD_COLORS[mood] || MOOD_COLORS.calm
}

export default function MoodDot({ mood, size = 8, color }) {
  const dot = color || getMoodColors(mood).dot
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: dot,
        flexShrink: 0,
      }}
    />
  )
}
