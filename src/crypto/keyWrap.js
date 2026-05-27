// Key wrapping utilities — used to protect the DEK with biometric PRF output or PIN.
// NEVER log raw key bytes or PRF output.

import { base64ToUint8Array, uint8ArrayToBase64, generateIV, generateSalt } from './index.js'

async function aesGCMKeyFromBytes(bytes) {
  return crypto.subtle.importKey(
    'raw', bytes,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

// Wrap rawDekBytes (Uint8Array) with wrappingBytes (Uint8Array, 32 bytes).
export async function wrapDEK(rawDekBytes, wrappingBytes) {
  const wrappingKey = await aesGCMKeyFromBytes(wrappingBytes)
  const iv = generateIV()
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    wrappingKey,
    rawDekBytes,
  )
  return {
    wrapped: uint8ArrayToBase64(new Uint8Array(cipherBuffer)),
    wrapIv: uint8ArrayToBase64(iv),
  }
}

// Unwrap and re-import as a non-extractable AES-GCM CryptoKey.
export async function unwrapDEK(wrappedBase64, wrapIvBase64, wrappingBytes) {
  const wrappingKey = await aesGCMKeyFromBytes(wrappingBytes)
  const rawDek = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToUint8Array(wrapIvBase64) },
    wrappingKey,
    base64ToUint8Array(wrappedBase64),
  )
  return crypto.subtle.importKey(
    'raw', rawDek,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

// Derive 32 bytes from a PIN using PBKDF2 for use as wrapping key material.
export async function derivePINBytes(pin, saltBase64) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: base64ToUint8Array(saltBase64), iterations: 300_000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return new Uint8Array(bits)
}

export { generateSalt }
