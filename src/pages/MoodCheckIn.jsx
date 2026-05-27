import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

const MOODS = [
  { name: 'tender',   color: '#E8C4B0', dot: '#D8A892' },
  { name: 'calm',     color: '#DCDDC7', dot: '#9CA888' },
  { name: 'warm',     color: '#EDD3BD', dot: '#B8896C' },
  { name: 'hopeful',  color: '#E5D2A8', dot: '#C9B080' },
  { name: 'restless', color: '#D9B895', dot: '#B89678' },
  { name: 'heavy',    color: '#C9B8A8', dot: '#8B7E6E' },
]

export default function MoodCheckIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selected, setSelected] = useState(null)
  const [note, setNote] = useState('')

  const handleContinue = () => {
    navigate('/new', { state: { mood: selected, moodNote: note, from: location.state?.from } })
  }

  const handleSkip = () => {
    navigate('/new', { state: { from: location.state?.from } })
  }

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--terra-50)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <StatusBar />

      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '46px 24px 0',
        }}
      >
        <button
          onClick={handleSkip}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--ink-500)',
            fontWeight: 500,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Skip
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: 18,
                height: 3,
                borderRadius: 2,
                background: i === 1 ? 'var(--ink-900)' : 'var(--hairline-strong)',
              }}
            />
          ))}
        </div>
        <button
          onClick={handleContinue}
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--ink-900)',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Next
        </button>
      </div>

      <div style={{ padding: '70px 32px 0' }}>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 12,
            letterSpacing: 2,
            color: 'var(--terra-400)',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Tonight
        </div>
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 38,
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: -0.6,
            margin: '12px 0 0',
            color: 'var(--ink-900)',
          }}
        >
          How would you
          <br />
          describe today
          <span style={{ color: 'var(--terra-300)' }}>?</span>
        </h1>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 16,
            fontStyle: 'italic',
            color: 'var(--ink-500)',
            marginTop: 12,
          }}
        >
          Pick one. There's no wrong answer.
        </p>
      </div>

      {/* Mood grid */}
      <div
        style={{
          padding: '50px 32px 0',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 20,
          justifyItems: 'center',
        }}
      >
        {MOODS.map((mood) => {
          const isSelected = selected === mood.name
          return (
            <button
              key={mood.name}
              onClick={() => setSelected(mood.name)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                padding: 0,
              }}
            >
              <div
                style={{
                  width: 78,
                  height: 78,
                  borderRadius: 39,
                  background: mood.color,
                  border: isSelected ? '3px solid var(--ink-900)' : 'none',
                  boxShadow: isSelected
                    ? '0 0 0 5px var(--terra-50), 0 8px 20px rgba(58,51,43,0.12)'
                    : '0 4px 12px rgba(58,51,43,0.06)',
                  position: 'relative',
                  transition: 'box-shadow 0.15s, border 0.15s',
                }}
              >
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -3,
                      right: -3,
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      background: 'var(--ink-900)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l3 3 5-6" stroke="#FAF5EC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>
              <div
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 15,
                  fontWeight: isSelected ? 600 : 400,
                  color: 'var(--ink-900)',
                }}
              >
                {mood.name}
              </div>
            </button>
          )
        })}
      </div>

      {/* Optional word */}
      <div style={{ padding: '48px 32px 0' }}>
        <div
          style={{
            fontFamily: 'var(--sans)',
            fontSize: 11,
            letterSpacing: 1.6,
            color: 'var(--ink-500)',
            textTransform: 'uppercase',
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          One word for today (optional)
        </div>
        <div
          style={{
            padding: '14px 16px',
            background: 'var(--bg-paper)',
            borderRadius: 14,
          }}
        >
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="gentle, slow, golden…"
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontFamily: 'var(--serif)',
              fontStyle: 'italic',
              fontSize: 16,
              color: 'var(--ink-900)',
            }}
          />
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '32px 24px 48px' }}>
        <button
          onClick={handleContinue}
          style={{
            width: '100%',
            padding: '16px',
            background: 'var(--ink-900)',
            color: 'var(--bg-paper)',
            border: 'none',
            borderRadius: 18,
            fontFamily: 'var(--sans)',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Continue to writing
        </button>
      </div>

      <HomeIndicator />
    </div>
  )
}
