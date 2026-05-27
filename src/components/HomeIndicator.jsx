export default function HomeIndicator({ tint = 'var(--ink-900)' }) {
  return (
    <div
      className="mobile-only"
      style={{
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 50,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 120,
          height: 4,
          borderRadius: 2,
          background: tint,
          opacity: 0.35,
        }}
      />
    </div>
  )
}
