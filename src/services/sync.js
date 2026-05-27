import { supabase } from '../supabaseClient'
import db from '../db'

/**
 * Push all locally pending entries to Supabase.
 * Entries with pending_sync = 1 are upserted to the remote table.
 * On success, marks them pending_sync = 0.
 */
export async function push() {
  const pending = await db.entries.where('pending_sync').equals(1).toArray()
  if (pending.length === 0) return

  // Strip the pending_sync field — Supabase table doesn't have it
  const rows = pending.map(({ pending_sync, ...rest }) => rest)

  const { error } = await supabase
    .from('entries')
    .upsert(rows, { onConflict: 'id' })

  if (error) throw error

  // Mark as synced locally
  await db.entries
    .where('id')
    .anyOf(pending.map((e) => e.id))
    .modify({ pending_sync: 0 })
}

/**
 * Pull all entries from Supabase for the current user.
 * Merges into IndexedDB using last-write-wins on client_updated_at.
 */
export async function pull() {
  const { data: remote, error } = await supabase
    .from('entries')
    .select('*')
    .order('client_updated_at', { ascending: false })

  if (error) throw error
  if (!remote || remote.length === 0) return

  await db.transaction('rw', db.entries, async () => {
    for (const remoteEntry of remote) {
      const local = await db.entries.get(remoteEntry.id)
      if (!local) {
        // New entry from remote — add it with pending_sync = 0
        await db.entries.put({ ...remoteEntry, pending_sync: 0 })
      } else {
        // Compare client_updated_at for conflict resolution
        const remoteTime = new Date(remoteEntry.client_updated_at).getTime()
        const localTime = new Date(local.client_updated_at).getTime()
        if (remoteTime > localTime && local.pending_sync === 0) {
          // Remote wins — update local
          await db.entries.put({ ...remoteEntry, pending_sync: 0 })
        }
        // If local is newer (or has pending changes), local wins — skip
      }
    }
  })
}

/**
 * Full sync: push pending local writes, then pull remote.
 */
export async function sync() {
  await push()
  await pull()
}
