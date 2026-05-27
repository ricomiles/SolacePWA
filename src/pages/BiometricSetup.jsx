import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isBiometricAvailable, enrollBiometric } from '../crypto/webauthn'
import { wrapDEK, derivePINBytes, generateSalt } from '../crypto/keyWrap'
import { getRawDEK, clearRawDEK } from '../store/setupStore'
import { useAuth } from '../hooks/useAuth'
import db from '../db'
import StatusBar from '../components/StatusBar'
import HomeIndicator from '../components/HomeIndicator'

// ── PIN pad ───────────────────────────────────────────────────────────────────
function PINPad({ value, onChange, disabled }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']
  return (
    <div>
      {/* 6-dot indicator */}
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 36 }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: 7,
            background: i < value.length ? 'var(--ink-900)' : 'var(--hairline-strong)',
            transition: 'background 0.15s',
          }} />
        ))}
      </div>
      {/* Keypad */}
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

export default function BiometricSetup() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [biometricAvailable, setBiometricAvailable] = useState(null)
  const [step, setStep] = useState('loading') // loading | choice | pin-set | pin-confirm | saving
  const [pin, setPin] = useState('')
  const [pinConfirm, setPinConfirm] = useState('')
  const [pinError, setPinError] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    isBiometricAvailable().then(available => {
      setBiometricAvailable(available)
      setStep(available ? 'choice' : 'pin-set')
    })
  }, [])

  // If raw DEK is gone (e.g. page refresh), go home — key is already in memory
  useEffect(() => {
    if (!getRawDEK() && step !== 'loading') {
      navigate('/home', { replace: true })
    }
  }, [step, navigate])

  // Auto-advance PIN confirm after 6 digits
  useEffect(() => {
    if (pin.length === 6 && step === 'pin-set') {
      setStep('pin-confirm')
    }
  }, [pin, step])

  useEffect(() => {
    if (pinConfirm.length === 6 && step === 'pin-confirm') {
      handlePINConfirm()
    }
  }, [pinConfirm, step]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleBiometric = async () => {
    setError('')
    setStep('saving')
    try {
      const rawDEK = getRawDEK()
      if (!rawDEK) throw new Error('Key not found — please re-enter your phrase.')
      const { credentialId, prfBytes, prfSupported } = await enrollBiometric(user.id)
      if (!prfSupported) {
        // PRF not supported despite platform authenticator being available — fall back to PIN
        setStep('pin-set')
        return
      }
      const { wrapped, wrapIv } = await wrapDEK(rawDEK, prfBytes)
      await db.localAuth.put({ user_id: user.id, method: 'prf', wrapped_dek: wrapped, wrap_iv: wrapIv, credential_id: credentialId })
      clearRawDEK()
      navigate('/home', { replace: true })
    } catch (err) {
      if (err.message?.includes('biometric-cancelled') || err.message?.includes('NotAllowedError')) {
        setStep('choice')
      } else {
        setError(err.message || 'Something went wrong. Try again.')
        setStep('choice')
      }
    }
  }

  const handlePINConfirm = async () => {
    if (pin !== pinConfirm) {
      setPinError("PINs don't match. Start again.")
      setPin('')
      setPinConfirm('')
      setStep('pin-set')
      return
    }
    setStep('saving')
    try {
      const rawDEK = getRawDEK()
      if (!rawDEK) throw new Error('Key not found — please re-enter your phrase.')
      const pinSalt = generateSalt()
      const pinBytes = await derivePINBytes(pin, pinSalt)
      const { wrapped, wrapIv } = await wrapDEK(rawDEK, pinBytes)
      await db.localAuth.put({ user_id: user.id, method: 'pin', wrapped_dek: wrapped, wrap_iv: wrapIv, pin_salt: pinSalt })
      clearRawDEK()
      navigate('/home', { replace: true })
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setStep('pin-set')
    }
  }

  if (step === 'loading') return null

  const t = false // tablet layout handled elsewhere; keep mobile-first

  return (
    <div style={{ flex: 1, background: 'var(--bg-cream)', display: 'flex', flexDirection: 'column' }}>
      <StatusBar />
      <div style={{ flex: 1, padding: '56px 28px 60px', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontFamily: 'var(--sans)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--terra-400)', fontWeight: 700, marginBottom: 10 }}>
            Secure this device
          </div>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 32, fontWeight: 400, letterSpacing: -0.5, color: 'var(--ink-900)', margin: '0 0 10px', lineHeight: 1.2 }}>
            {step === 'choice' && 'How should we unlock your journal?'}
            {step === 'pin-set' && 'Set a 6-digit PIN'}
            {step === 'pin-confirm' && 'Confirm your PIN'}
            {step === 'saving' && 'Setting up…'}
          </h1>
          <p style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 15, color: 'var(--ink-500)', margin: 0, lineHeight: 1.6 }}>
            {step === 'choice' && 'Your recovery phrase is only needed for new devices.'}
            {step === 'pin-set' && "You'll enter this every time you open Solace."}
            {step === 'pin-confirm' && 'Enter the same PIN again to confirm.'}
            {step === 'saving' && 'Almost done…'}
          </p>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#FDF0EC', borderRadius: 10, fontFamily: 'var(--sans)', fontSize: 13, color: '#A04F3A', marginBottom: 24 }}>
            {error}
          </div>
        )}

        {pinError && (step === 'pin-set') && (
          <div style={{ padding: '10px 14px', background: '#FDF0EC', borderRadius: 10, fontFamily: 'var(--sans)', fontSize: 13, color: '#A04F3A', marginBottom: 24 }}>
            {pinError}
          </div>
        )}

        {/* Choice step */}
        {step === 'choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <button
              onClick={handleBiometric}
              style={{
                padding: '20px 24px', borderRadius: 18, background: 'var(--ink-900)',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 22, background: 'rgba(250,245,236,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="8" r="3.5" stroke="#FAF5EC" strokeWidth="1.4" />
                  <path d="M4 19c0-3.866 3.134-7 7-7h0c3.866 0 7 3.134 7 7" stroke="#FAF5EC" strokeWidth="1.4" strokeLinecap="round" />
                  <path d="M7 8c0 .5.1 1 .3 1.4M14.7 9.4C14.9 9 15 8.5 15 8" stroke="#FAF5EC" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: 'var(--bg-paper)' }}>Use Face ID / Touch ID</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'rgba(250,245,236,0.6)', marginTop: 2 }}>Unlock with biometrics. Fastest.</div>
              </div>
            </button>

            <button
              onClick={() => { setStep('pin-set'); setPin(''); setPinError('') }}
              style={{
                padding: '20px 24px', borderRadius: 18, background: 'var(--bg-paper)',
                border: '1px solid var(--hairline)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 22, background: 'var(--terra-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="22" viewBox="0 0 18 22" fill="none">
                  <rect x="1.5" y="9" width="15" height="12" rx="2.5" stroke="var(--terra-400)" strokeWidth="1.4" />
                  <path d="M5 9V6a4 4 0 118 0v3" stroke="var(--terra-400)" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="9" cy="15" r="1.5" fill="var(--terra-400)" />
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 15, fontWeight: 600, color: 'var(--ink-900)' }}>Use a 6-digit PIN</div>
                <div style={{ fontFamily: 'var(--sans)', fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>Works on any device.</div>
              </div>
            </button>
          </div>
        )}

        {/* PIN entry steps */}
        {(step === 'pin-set' || step === 'pin-confirm') && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <PINPad
              value={step === 'pin-set' ? pin : pinConfirm}
              onChange={step === 'pin-set' ? setPin : setPinConfirm}
            />
            {step === 'pin-confirm' && (
              <button
                onClick={() => { setStep('pin-set'); setPinConfirm('') }}
                style={{ marginTop: 28, background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--ink-500)', cursor: 'pointer' }}
              >
                ← Start over
              </button>
            )}
            {biometricAvailable && step === 'pin-set' && (
              <button
                onClick={() => setStep('choice')}
                style={{ marginTop: 16, background: 'none', border: 'none', fontFamily: 'var(--sans)', fontSize: 13, color: 'var(--terra-400)', cursor: 'pointer', fontWeight: 600 }}
              >
                Use Face ID instead
              </button>
            )}
          </div>
        )}

        {step === 'saving' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--terra-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 20, height: 20, border: '2px solid var(--terra-400)', borderTopColor: 'transparent', borderRadius: 10, animation: 'spin 0.7s linear infinite' }} />
            </div>
          </div>
        )}
      </div>

      <HomeIndicator />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
