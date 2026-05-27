// Temporary in-memory store for raw DEK bytes during the auth setup flow.
// Holds the exportable key bytes only long enough for BiometricSetup to wrap them.
// Must be cleared immediately after wrapping.

let _rawDEK = null

export const setRawDEK = (bytes) => { _rawDEK = bytes }
export const getRawDEK = () => _rawDEK
export const clearRawDEK = () => { _rawDEK = null }
export const hasRawDEK = () => _rawDEK !== null
