import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'
import { getKey } from '../store/cryptoStore'
import { encrypt, decrypt } from '../crypto'
import { useAuth } from './useAuth'
import { sync } from '../services/sync'

export function useEntries() {
  const { user } = useAuth()
  const [decryptedEntries, setDecryptedEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Live query from IndexedDB
  const rawEntries = useLiveQuery(
    () =>
      user
        ? db.entries
            .where('user_id')
            .equals(user.id)
            .filter((e) => !e.deleted)
            .reverse()
            .sortBy('client_updated_at')
        : [],
    [user],
  )

  // Decrypt entries whenever raw entries change
  useEffect(() => {
    if (!rawEntries) return
    const key = getKey()
    if (!key) {
      setDecryptedEntries([])
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    Promise.all(
      rawEntries.map(async (entry) => {
        try {
          const plaintext = await decrypt(key, entry.ciphertext, entry.iv)
          const parsed = JSON.parse(plaintext)
          return {
            ...entry,
            title: parsed.title || '',
            body: parsed.body || '',
            mood: parsed.mood || null,
            moodColor: parsed.moodColor || null,
            prompt: parsed.prompt || null,
            wordCount: parsed.body ? parsed.body.trim().split(/\s+/).filter(Boolean).length : 0,
          }
        } catch {
          // If decryption fails, return entry without plaintext fields
          return { ...entry, title: '[encrypted]', body: '', mood: null, moodColor: null, prompt: null, wordCount: 0 }
        }
      }),
    ).then((results) => {
      if (!cancelled) {
        setDecryptedEntries(results)
        setLoading(false)
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err)
        setLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [rawEntries])

  const createEntry = useCallback(async ({ title, body, mood, moodColor, prompt }) => {
    const key = getKey()
    if (!key || !user) throw new Error('No key or user')

    const plaintext = JSON.stringify({ title, body, mood, moodColor: moodColor || null, prompt: prompt || null })
    const { ciphertext, iv } = await encrypt(key, plaintext)

    const now = new Date().toISOString()
    const entry = {
      id: crypto.randomUUID(),
      user_id: user.id,
      ciphertext,
      iv,
      created_at: now,
      updated_at: now,
      client_updated_at: now,
      pending_sync: 1,
      deleted: false,
    }

    await db.entries.put(entry)

    // Trigger sync if online
    if (navigator.onLine) {
      sync().catch(() => {/* silently fail — will retry on next online event */})
    }

    return entry
  }, [user])

  const updateEntry = useCallback(async (id, { title, body, mood, moodColor, prompt }) => {
    const key = getKey()
    if (!key || !user) throw new Error('No key or user')

    const plaintext = JSON.stringify({ title, body, mood, moodColor: moodColor || null, prompt: prompt || null })
    const { ciphertext, iv } = await encrypt(key, plaintext)

    const now = new Date().toISOString()
    await db.entries.update(id, {
      ciphertext,
      iv,
      updated_at: now,
      client_updated_at: now,
      pending_sync: 1,
    })

    if (navigator.onLine) {
      sync().catch(() => {})
    }
  }, [user])

  const deleteEntry = useCallback(async (id) => {
    if (!user) throw new Error('No user')
    const now = new Date().toISOString()
    // Soft delete — mark as deleted, still sync the tombstone
    await db.entries.update(id, {
      deleted: true,
      updated_at: now,
      client_updated_at: now,
      pending_sync: 1,
    })

    if (navigator.onLine) {
      sync().catch(() => {})
    }
  }, [user])

  return {
    entries: decryptedEntries,
    loading,
    error,
    createEntry,
    updateEntry,
    deleteEntry,
  }
}
