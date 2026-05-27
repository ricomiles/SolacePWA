import Dexie from 'dexie'

const db = new Dexie('SolaceJournal')

db.version(1).stores({
  // entries: indexed fields (not all fields — just ones we query/sort by)
  entries: 'id, user_id, pending_sync, created_at, updated_at, client_updated_at',
  // keyCache: { user_id, mnemonic } — cached locally for convenience
  keyCache: 'user_id',
})

export default db
