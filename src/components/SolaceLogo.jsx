// Horizon mark: half-disc sun on a horizon line + "Solace" italic wordmark

function SolaceMark({ size = 80, sun = '#D4A88C', line = '#3A332B' }) {
  const strokeW = Math.max(3, Math.round(size * 0.034))
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox="0 0 200 110"
      style={{ display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <clipPath id="solace-horizon-clip">
          <rect x="0" y="0" width="200" height="90" />
        </clipPath>
      </defs>
      <g clipPath="url(#solace-horizon-clip)">
        <circle cx="100" cy="90" r="52" fill={sun} />
      </g>
      <line
        x1="14" y1="90" x2="186" y2="90"
        stroke={line}
        strokeWidth={strokeW}
        strokeLinecap="round"
      />
    </svg>
  )
}

// Vertical lockup — mark above wordmark (for welcome screen, splash)
export function SolaceLogo({ size = 96, sun = '#D4A88C', line = '#3A332B', wordColor = '#3A332B' }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: size * 0.18 }}>
      <SolaceMark size={size} sun={sun} line={line} />
      <div style={{
        fontFamily: "'Newsreader', 'Iowan Old Style', Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: size * 0.32,
        letterSpacing: '-0.015em',
        lineHeight: 1,
        color: wordColor,
      }}>
        Solace
      </div>
    </div>
  )
}

// Horizontal lockup — for nav bars (mark left, wordmark right)
export function SolaceLogoInline({ size = 36, sun = '#D4A88C', line = '#3A332B', wordColor = '#3A332B' }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: size * 0.35 }}>
      <SolaceMark size={size * 1.4} sun={sun} line={line} />
      <div style={{
        fontFamily: "'Newsreader', 'Iowan Old Style', Georgia, serif",
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: size,
        letterSpacing: '-0.015em',
        lineHeight: 1,
        color: wordColor,
      }}>
        Solace
      </div>
    </div>
  )
}

export default SolaceMark
