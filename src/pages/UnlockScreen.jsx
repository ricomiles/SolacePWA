import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { assertBiometric } from '../crypto/webauthn'
import { unwrapDEK, derivePINBytes } from '../crypto/keyWrap'
import { deriveKey, deriveKeyExtractable } from '../crypto'
import { setKey } from '../store/cryptoStore'
import { setRawDEK } from '../store/setupStore'
import { fetchSalt } from '../services/auth'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../supabaseClient'
import db from '../db'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'
import { SolaceLogoInline } from '../components/SolaceLogo'

function PINPad({ value, onChange, disabled }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']
  return (
    <div>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 36 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 7,
            background: i < value.length ? 'var(--ink-900)' : 'var(--hairline-strong)',
            transition: 'background 0.15s',
          }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 280, margin: '0 auto' }}>
        {keys.map((k, i) => {
          if (!k) return <div key={i} />
          if (k === '⌫') return (
            <button key={i} onClick={() => onChange(v => v.slice(0, -1))} disabled={disabled}
              style={{ height: 68, borderRadius: 16, background: 'var(--bg-warm)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <path d="M7 1H18a1 1 0 011 1v12a1 1 0 01-1 1H7L1 8l6-7z" stroke="var(--ink-700)" strokeWidth="1.4" fill="none" />
                <path d="M9 6l4 4M13 6l-4 4" stroke="var(--ink-700)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </button>
          )
          return (
            <button key={i} onClick={() => { if (value.length < 6) onChange(v => v + k) }} disabled={disabled}
              style={{ height: 68, borderRadius: 16, background: 'var(--bg-paper)', border: '1px solid var(--hairline)', cursor: 'pointer', fontFamily: 'var(--serif)', fontSize: 26, fontWeight: 400, color: 'var(--ink-900)' }}>
              {k}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function UnlockScreen() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [localAuth, setLocalAuth] = useState(null)
  const [mode, setMode] = useState('loading') // loading | biometric | pin | phrase-fallback
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => {
    if (!user) return
    async function init() {
      // Check for existing localAuth record
      const auth = await db.localAuth.get(user.id)

      if (auth) {
        setLocalAuth(auth)
        setMode(auth.method === 'prf' ? 'biometric' : 'pin')
        return
      }

      // Migration: old device with cached mnemonic — auto-derive + redirect to setup
      const cached = await db.keyCache.get(user.id)
      if (cached?.mnemonic) {
        try {
          const salt = await fetchSalt(user.id)
          const extractableKey = await deriveKeyExtractable(cached.mnemonic, salt)
          const rawDEK = new Uint8Array(await crypto.subtle.exportKey('raw', extractableKey))
          const nonExtractable = await crypto.subtle.importKey(
            'raw', rawDEK, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
          )
          setRawDEK(rawDEK)
          setKey(nonExtractable)
          await db.keyCache.delete(user.id)
          navigate('/setup-auth', { replace: true })
        } catch {
          navigate('/phrase', { replace: true })
        }
        return
      }

      // New device — go to phrase entry
      navigate('/phrase', { replace: true })
    }
    init()
  }, [user, navigate])

  // Auto-trigger biometric on load
  useEffect(() => {
    if (mode === 'biometric' && localAuth) {
      handleBiometric()
    }
  }, [mode, localAuth]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-submit PIN when 6 digits entered
  useEffect(() => {
    if (pin.length === 6 && mode === 'pin') {
      handlePIN()
    }
  }, [pin]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBiometric = async () => {
    if (unlocking || !localAuth) return
    setError('')
    setUnlocking(true)
    try {
      const prfBytes = await assertBiometric(localAuth.credential_id)
      const key = await unwrapDEK(localAuth.wrapped_dek, localAuth.wrap_iv, prfBytes)
      setKey(key)
      navigate('/home', { replace: true })
    } catch (err) {
      setUnlocking(false)
      if (err.message === 'biometric-cancelled') {
        setError('') // cancelled, just show the button again
      } else {
        setError('Face ID failed. Try again or use your PIN.')
      }
    }
  }

  const handlePIN = async () => {
    if (unlocking || !localAuth) return
    setError('')
    setUnlocking(true)
    try {
      const pinBytes = await derivePINBytes(pin, localAuth.pin_salt)
      const key = await unwrapDEK(localAuth.wrapped_dek, localAuth.wrap_iv, pinBytes)
      setKey(key)
      navigate('/home', { replace: true })
    } catch {
      setUnlocking(false)
      setPin('')
      setError('Incorrect PIN. Try again.')
    }
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning.' : hour < 17 ? 'Good afternoon.' : 'Good evening.'

  if (mode === 'loading') return null

  return (
    <div style={{ flex: 1, background: 'var(--bg-cream)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ flex: 1, padding: '56px 28px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

        {/* Logo + greeting */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <SolaceLogoInline size={20} sun="var(--terra-200)" line="var(--ink-900)" wordColor="var(--ink-900)" />
          <div style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-500)', marginTop: 16 }}>
            {greeting}
          </div>
        </div>

        {error && (
          <div style={{ width: '100%', padding: '10px 14px', background: '#FDF0EC', borderRadius: 10, fontFamily: 'var(--sans)', fontSize: 13, color: '#A04F3A', marginBottom: 24, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Biometric mode */}
        {mode === 'biometric' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, width: '100%' }}>
            <button
              onClick={handleBiometric}
              disabled={unlocking}
              style={{
                width: 96, height: 96, borderRadius: 48,
                background: unlocking ? 'var(--terra-100)' : 'var(--terra-200)',
                border: 'none', cursor: unlocking ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(184,137,108,0.28)',
                transition: 'background 0.2s',
              }}
            >
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <path d="M13 10C13 7.239 15.239 5 18 5s5 2.239 5 5M9 31c0-4.971 4.029-9 9-9s9 4.029 9 9" stroke="var(--bg-paper)" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="18" cy="14" r="5" stroke="var(--bg-paper)" strokeWidth="2"/>
                <path d="M11 18a7.5 7.5 0 0114 0" stroke="var(--bg-paper)" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </button>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 14, color: 'var(--ink-700)', fontWeight: 600 }}>
              {unlocking ? 'Unlocking…' : 'Tap to use Face ID'}
            </div>
            <button
              onClick={() => { setMode('pin'); setError('') }}
              style={{ background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-500)', cursor: 'pointer', marginTop: 8 }}
            >
              Use PIN instead
            </button>
          </div>
        )}

        {/* PIN mode */}
        {mode === 'pin' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
            <div style={{ fontFamily: 'var(--sans)', fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-500)', fontWeight: 700, textAlign: 'center', marginBottom: 32 }}>
              Enter your PIN
            </div>
            <PINPad value={pin} onChange={setPin} disabled={unlocking} />
            {localAuth?.method === 'prf' && (
              <button
                onClick={() => { setMode('biometric'); setPin(''); setError('') }}
                style={{ marginTop: 24, background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--terra-400)', cursor: 'pointer', fontWeight: 600 }}
              >
                Use Face ID instead
              </button>
            )}
            <button
              onClick={() => navigate('/phrase')}
              style={{ marginTop: 12, background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-400)', cursor: 'pointer' }}
            >
              Use recovery phrase
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => supabase.auth.signOut()}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-400)',
          padding: '12px 0 8px', width: '100%', textAlign: 'center',
        }}
      >
        Sign out
      </button>
      <HomeIndicator />
    </div>
  )
}
