// Web Crypto API wrappers — zero plaintext ever leaves this module
// NEVER log plaintext, mnemonic, or key material

/**
 * Convert Uint8Array to base64 string
 */
export function uint8ArrayToBase64(arr) {
  let binary = ''
  for (let i = 0; i < arr.byteLength; i++) {
    binary += String.fromCharCode(arr[i])
  }
  return btoa(binary)
}

/**
 * Convert base64 string to Uint8Array
 */
export function base64ToUint8Array(b64) {
  const binary = atob(b64)
  const arr = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    arr[i] = binary.charCodeAt(i)
  }
  return arr
}

/**
 * Generate a random 16-byte salt, returned as base64 string.
 * Uses crypto.getRandomValues — never Math.random.
 */
export function generateSalt() {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return uint8ArrayToBase64(bytes)
}

/**
 * Generate a random 12-byte IV for AES-GCM.
 */
export function generateIV() {
  const iv = new Uint8Array(12)
  crypto.getRandomValues(iv)
  return iv
}

/**
 * Derive an AES-GCM-256 CryptoKey from a mnemonic phrase and base64 salt.
 * Uses PBKDF2 with 600,000 iterations and SHA-256.
 * The returned CryptoKey is non-extractable.
 */
export async function deriveKey(mnemonic, saltBase64) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(mnemonic),
    { name: 'PBKDF2' },
    false, // non-extractable
    ['deriveBits', 'deriveKey'],
  )

  const salt = base64ToUint8Array(saltBase64)

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 600_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // non-extractable
    ['encrypt', 'decrypt'],
  )
}

/**
 * Same as deriveKey but extractable: true — needed for key-wrapping during auth setup.
 * Export and clear the raw bytes immediately after use.
 */
export async function deriveKeyExtractable(mnemonic, saltBase64) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(mnemonic),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey'],
  )
  const salt = base64ToUint8Array(saltBase64)
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt'],
  )
}

/**
 * Encrypt a plaintext string with an AES-GCM CryptoKey.
 * Returns { ciphertext: base64, iv: base64 }
 */
export async function encrypt(key, plaintext) {
  const enc = new TextEncoder()
  const iv = generateIV()
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plaintext),
  )
  return {
    ciphertext: uint8ArrayToBase64(new Uint8Array(cipherBuffer)),
    iv: uint8ArrayToBase64(iv),
  }
}

/**
 * Decrypt a base64 ciphertext with AES-GCM.
 * Returns the plaintext string.
 */
export async function decrypt(key, ciphertextBase64, ivBase64) {
  const iv = base64ToUint8Array(ivBase64)
  const cipherBuffer = base64ToUint8Array(ciphertextBase64)
  const plainBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    cipherBuffer,
  )
  const dec = new TextDecoder()
  return dec.decode(plainBuffer)
}
