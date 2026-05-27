import Dexie from 'dexie'

const db = new Dexie('Solace')

db.version(1).stores({
  entries: 'id, user_id, pending_sync, created_at, updated_at, client_updated_at',
  keyCache: 'user_id',
})

// version 2: add localAuth for biometric/PIN-wrapped DEK storage
db.version(2).stores({
  entries: 'id, user_id, pending_sync, created_at, updated_at, client_updated_at',
  keyCache: 'user_id',
  // localAuth: { user_id, method, wrapped_dek, wrap_iv, credential_id?, pin_salt? }
  localAuth: 'user_id',
})

export default db
