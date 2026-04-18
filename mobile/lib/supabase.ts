import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { isLikelySupabaseJwtAnonKey } from "@/lib/anon-key"

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim()

function isValidHttpUrl(s: string): boolean {
  if (!/^https?:\/\//i.test(s)) return false
  try {
    new URL(s)
    return true
  } catch {
    return false
  }
}

function useMockAuthFlag(): boolean {
  return process.env.EXPO_PUBLIC_USE_MOCK_AUTH === "true"
}

/**
 * Real Supabase session when URL + JWT anon key + mock flag off.
 * Otherwise the app uses client-only mock auth (`AuthContext`).
 */
export function isSupabaseConfigured(): boolean {
  if (useMockAuthFlag()) return false
  if (!url || !isValidHttpUrl(url)) return false
  if (!key || !isLikelySupabaseJwtAnonKey(key)) return false
  return true
}

if (!useMockAuthFlag() && url && key && !isLikelySupabaseJwtAnonKey(key)) {
  console.warn(
    "[wellness] EXPO_PUBLIC_SUPABASE_ANON_KEY should be the anon JWT (starts with eyJ). Using mock auth until fixed.",
  )
}

if (!useMockAuthFlag() && (!url || !key)) {
  console.warn(
    "[wellness] Supabase URL/key missing or invalid — using mock auth. Set EXPO_PUBLIC_* in mobile/.env (see mobile/.env.example) or root .env. Restart: npx expo start -c",
  )
} else if (url && !isValidHttpUrl(url)) {
  console.warn(
    "[wellness] EXPO_PUBLIC_SUPABASE_URL must be a full https URL (e.g. https://xxxx.supabase.co).",
  )
}

const authOptions = {
  storage: AsyncStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
} as const

/** Real client only when Supabase is fully configured; guard with `isSupabaseConfigured()`. */
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(url!, key!, { auth: authOptions })
  : (null as unknown as SupabaseClient)
