// Module-level singleton — holds the derived CryptoKey in memory.
// Never persisted to disk. Cleared on logout or manual lock.

let _key = null

export const setKey = (k) => {
  _key = k
}

export const getKey = () => _key

export const clearKey = () => {
  _key = null
}

export const hasKey = () => _key !== null
