// WebAuthn PRF utilities — allows Face ID / Touch ID to produce stable key material.
// PRF output is 32 bytes, deterministic per credential and eval input.

import { uint8ArrayToBase64, base64ToUint8Array } from './index.js'

// Domain-specific PRF input — ensures different apps can't share PRF output.
const PRF_EVAL_INPUT = new TextEncoder().encode('solace-journal-dek-v1')

export async function isBiometricAvailable() {
  if (!window.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable) return false
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

// Enroll a new platform credential (Face ID / Touch ID) and get the first PRF output.
// Returns { credentialId: base64, prfBytes: Uint8Array, prfSupported: bool }
export async function enrollBiometric(userId) {
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  // user.id must be ≤ 64 bytes
  const userBytes = new TextEncoder().encode(userId).slice(0, 64)

  let cred
  try {
    cred = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Solace Journal', id: window.location.hostname },
        user: { id: userBytes, name: 'solace-user', displayName: 'You' },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },   // ES256
          { type: 'public-key', alg: -257 },  // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        extensions: {
          prf: { eval: { first: PRF_EVAL_INPUT } },
        },
      },
    })
  } catch (err) {
    throw new Error('biometric-enrollment-failed: ' + err.message)
  }

  const prfOutput = cred.getClientExtensionResults()?.prf?.results?.first
  if (!prfOutput) {
    return { credentialId: null, prfBytes: null, prfSupported: false }
  }

  return {
    credentialId: uint8ArrayToBase64(new Uint8Array(cred.rawId)),
    prfBytes: new Uint8Array(prfOutput),
    prfSupported: true,
  }
}

// Assert an existing credential (triggers Face ID / Touch ID) and return PRF output.
// Uses discoverable credential lookup (no allowCredentials) so the system can find
// the passkey even if the stored credential ID drifts (e.g. after reinstall or
// iCloud Keychain sync). Security is preserved: the PRF output is credential-bound,
// so unwrapDEK will fail if the wrong passkey is used.
export async function assertBiometric() {
  const challenge = crypto.getRandomValues(new Uint8Array(32))

  let assertion
  try {
    assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        userVerification: 'required',
        extensions: {
          prf: { eval: { first: PRF_EVAL_INPUT } },
        },
      },
    })
  } catch (err) {
    if (err.name === 'NotAllowedError') throw new Error('biometric-cancelled')
    throw new Error('biometric-failed: ' + err.message)
  }

  const prfOutput = assertion.getClientExtensionResults()?.prf?.results?.first
  if (!prfOutput) throw new Error('prf-not-supported')

  return new Uint8Array(prfOutput)
}
