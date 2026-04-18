import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"

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

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key && isValidHttpUrl(url))
}

if (!url || !key) {
  console.warn(
    "[wellness] Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env or use NEXT_PUBLIC_* in the repo root .env (see mobile/.env.example). Restart Metro after changes: npx expo start -c",
  )
} else if (!isValidHttpUrl(url)) {
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

/** Real client only when env is valid; callers must guard with `isSupabaseConfigured()`. */
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(url!, key!, { auth: authOptions })
  : (null as unknown as SupabaseClient)
