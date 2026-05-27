import { supabase } from '../supabaseClient'
import { clearKey } from '../store/cryptoStore'

/**
 * Create a new Supabase user account.
 */
export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data.user
}

/**
 * Sign in an existing user.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

/**
 * Sign out: clear the in-memory key first, then Supabase session.
 */
export async function signOut() {
  clearKey()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Get the current session.
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

/**
 * Subscribe to auth state changes. Returns the subscription object.
 */
export function onAuthStateChange(cb) {
  return supabase.auth.onAuthStateChange(cb)
}

/**
 * Store the user's salt in user_keys table.
 * Only called once at signup.
 */
export async function upsertSalt(userId, saltBase64) {
  const { error } = await supabase
    .from('user_keys')
    .upsert({ user_id: userId, salt: saltBase64 }, { onConflict: 'user_id' })
  if (error) throw error
}

/**
 * Fetch the user's salt from user_keys table.
 */
export async function fetchSalt(userId) {
  const { data, error } = await supabase
    .from('user_keys')
    .select('salt')
    .eq('user_id', userId)
    .single()
  if (error) throw error
  return data?.salt ?? null
}
