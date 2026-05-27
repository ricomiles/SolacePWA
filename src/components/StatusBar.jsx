export default function StatusBar({ tint = 'var(--ink-900)' }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '18px 28px 0',
        fontFamily: 'var(--sans)',
        fontSize: 15,
        fontWeight: 600,
        color: tint,
        position: 'relative',
        zIndex: 5,
        flexShrink: 0,
      }}
    >
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {/* Signal bars */}
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <rect x="0" y="6" width="2.5" height="4" rx="0.5" fill={tint} />
          <rect x="4" y="4" width="2.5" height="6" rx="0.5" fill={tint} />
          <rect x="8" y="2" width="2.5" height="8" rx="0.5" fill={tint} />
          <rect x="12" y="0" width="2.5" height="10" rx="0.5" fill={tint} />
        </svg>
        {/* Battery */}
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
          <rect x="0.5" y="0.5" width="19" height="10" rx="2.5" stroke={tint} strokeOpacity="0.4" />
          <rect x="2" y="2" width="14" height="7" rx="1.5" fill={tint} />
        </svg>
      </span>
    </div>
  )
}
