import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { validateMnemonic } from '../crypto/bip39'
import { deriveKey, decrypt } from '../crypto'
import { setKey } from '../store/cryptoStore'
import { fetchSalt } from '../services/auth'
import { useAuth } from '../hooks/useAuth'
import db from '../db'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

export default function PhraseEntry() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [phrase, setPhrase] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const trimmed = phrase.trim().toLowerCase()

      // Validate BIP39 mnemonic
      if (!validateMnemonic(trimmed)) {
        setError('Invalid recovery phrase. Please check your words and try again.')
        setLoading(false)
        return
      }

      const currentUser = user
      if (!currentUser) {
        setError('You must be signed in to enter your phrase.')
        setLoading(false)
        return
      }

      // Fetch salt (may be passed via location state from login, or fetch fresh)
      let salt = location.state?.salt
      if (!salt) {
        salt = await fetchSalt(currentUser.id)
      }

      if (!salt) {
        setError('Could not find your encryption key. Please try signing in again.')
        setLoading(false)
        return
      }

      // Derive key
      const key = await deriveKey(trimmed, salt)

      // Validate key by trying to decrypt an existing entry (if any)
      const entries = await db.entries
        .where('user_id')
        .equals(currentUser.id)
        .first()

      if (entries?.ciphertext) {
        try {
          await decrypt(key, entries.ciphertext, entries.iv)
        } catch {
          setError('Incorrect recovery phrase. Please check your words and try again.')
          setLoading(false)
          return
        }
      }

      // Set key in memory
      setKey(key)

      // Cache mnemonic if user wants
      if (remember) {
        await db.keyCache.put({ user_id: currentUser.id, mnemonic: trimmed })
      }

      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        flex: 1,
        background: 'var(--bg-cream)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
      }}
    >
      <StatusBar />

      <div style={{ padding: '46px 28px 80px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h1
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 30,
            fontWeight: 400,
            letterSpacing: -0.5,
            margin: '0 0 8px',
            color: 'var(--ink-900)',
          }}
        >
          Enter your recovery phrase
        </h1>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontSize: 15,
            fontStyle: 'italic',
            color: 'var(--ink-700)',
            margin: '0 0 32px',
            lineHeight: 1.55,
          }}
        >
          Enter your 12-word phrase to unlock your journal on this device.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
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
              Recovery Phrase
            </label>
            <textarea
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              rows={4}
              placeholder="word1 word2 word3 word4 word5 word6 word7 word8 word9 word10 word11 word12"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'var(--bg-paper)',
                border: '1px solid var(--hairline-strong)',
                borderRadius: 14,
                fontFamily: 'var(--serif)',
                fontSize: 16,
                color: 'var(--ink-900)',
                outline: 'none',
                lineHeight: 1.7,
              }}
            />
          </div>

          {/* Remember checkbox */}
          <label
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              cursor: 'pointer',
            }}
          >
            <div
              onClick={() => setRemember((r) => !r)}
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                border: remember ? 'none' : '2px solid var(--ink-300)',
                background: remember ? 'var(--ink-900)' : 'transparent',
                flexShrink: 0,
                marginTop: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {remember && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="#FAF5EC" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span
              style={{
                fontFamily: 'var(--sans)',
                fontSize: 13,
                color: 'var(--ink-700)',
                lineHeight: 1.5,
              }}
            >
              Remember on this device (you can lock your journal in Settings)
            </span>
          </label>

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
            disabled={loading || !phrase.trim()}
            style={{
              width: '100%',
              padding: '16px',
              background: loading || !phrase.trim() ? 'var(--ink-300)' : 'var(--ink-900)',
              color: 'var(--bg-paper)',
              border: 'none',
              borderRadius: 18,
              fontFamily: 'var(--sans)',
              fontSize: 15,
              fontWeight: 600,
              cursor: loading || !phrase.trim() ? 'not-allowed' : 'pointer',
              marginBottom: 32,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Unlocking…' : 'Unlock journal'}
          </button>
        </form>
      </div>

      <HomeIndicator />
    </div>
  )
}
