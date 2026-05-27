import { useState, useEffect, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import db from '../db'
import { sync } from '../services/sync'
import { useAuth } from './useAuth'
import { hasKey } from '../store/cryptoStore'

export function useSync() {
  const { user } = useAuth()
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [error, setSyncError] = useState(null)

  // Count pending entries
  const pendingCount = useLiveQuery(
    () =>
      user
        ? db.entries.where('pending_sync').equals(1).count()
        : Promise.resolve(0),
    [user],
    0,
  )

  const doSync = useCallback(async () => {
    if (!user || !hasKey() || syncing) return
    setSyncing(true)
    setSyncError(null)
    try {
      await sync()
      setLastSync(new Date())
    } catch (err) {
      setSyncError(err)
    } finally {
      setSyncing(false)
    }
  }, [user, syncing])

  useEffect(() => {
    const handleOnline = () => {
      doSync()
    }

    window.addEventListener('online', handleOnline)

    // Sync on mount if we're online
    if (navigator.onLine && user && hasKey()) {
      doSync()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  return { syncing, lastSync, pendingCount, doSync, error }
}
