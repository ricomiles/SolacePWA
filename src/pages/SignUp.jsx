import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signUp, upsertSalt } from '../services/auth'
import { generateMnemonic } from '../crypto/bip39'
import { generateSalt, deriveKey } from '../crypto'
import { setKey } from '../store/cryptoStore'
import db from '../db'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

export default function SignUp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Create Supabase account
      const user = await signUp(email, password)

      // 2. Generate mnemonic + salt
      const mnemonic = generateMnemonic()
      const salt = generateSalt()

      // 3. Derive key from mnemonic + salt
      const key = await deriveKey(mnemonic, salt)

      // 4. Store salt in Supabase user_keys
      await upsertSalt(user.id, salt)

      // 5. Set key in memory
      setKey(key)

      // 6. Cache mnemonic in IndexedDB (default: on)
      await db.keyCache.put({ user_id: user.id, mnemonic })

      // 7. Navigate to mnemonic display — pass mnemonic via location state (never over network)
      navigate('/mnemonic', { state: { mnemonic }, replace: true })
    } catch (err) {
      setError(err.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--bg-paper)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <StatusBar />

      <div style={{ padding: '46px 32px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Back */}
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'var(--sans)',
            fontSize: 14,
            color: 'var(--ink-500)',
            fontWeight: 500,
            textDecoration: 'none',
            marginBottom: 40,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7l5 5" stroke="var(--ink-500)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Back
        </Link>

        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 36,
            fontWeight: 400,
            letterSpacing: -0.6,
            margin: '0 0 8px',
            color: 'var(--ink-900)',
          }}
        >
          Create account
        </h1>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 15,
            fontStyle: 'italic',
            color: 'var(--ink-500)',
            margin: '0 0 40px',
          }}
        >
          Your entries are encrypted. Only you can read them.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--sans)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                color: 'var(--ink-500)',
                marginBottom: 8,
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--bg-cream)',
                border: '1px solid var(--hairline-strong)',
                borderRadius: 14,
                fontFamily: 'var(--sans)',
                fontSize: 15,
                color: 'var(--ink-900)',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontFamily: 'var(--sans)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                color: 'var(--ink-500)',
                marginBottom: 8,
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="At least 8 characters"
              minLength={8}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--bg-cream)',
                border: '1px solid var(--hairline-strong)',
                borderRadius: 14,
                fontFamily: 'var(--sans)',
                fontSize: 15,
                color: 'var(--ink-900)',
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <p
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 13,
                color: '#A04F3A',
                margin: 0,
                padding: '10px 14px',
                background: '#FDF0EC',
                borderRadius: 10,
              }}
            >
              {error}
            </p>
          )}

          <div style={{ flex: 1 }} />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              background: loading ? 'var(--ink-300)' : 'var(--ink-900)',
              color: 'var(--bg-paper)',
              border: 'none',
              borderRadius: 18,
              fontFamily: 'var(--sans)',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: 16,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </button>

          <p
            style={{
              fontFamily: 'var(--sans)',
              fontSize: 13,
              color: 'var(--ink-500)',
              textAlign: 'center',
              margin: '0 0 32px',
            }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: 'var(--terra-300)', fontWeight: 600, textDecoration: 'none' }}
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>

      <HomeIndicator />
    </div>
  )
}
