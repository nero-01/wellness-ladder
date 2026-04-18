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

let client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in mobile/.env, or NEXT_PUBLIC_SUPABASE_* in the repo root .env. Restart Metro with npx expo start -c.",
    )
  }
  if (!client) {
    client = createClient(url!, key!, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  }
  return client
}

/** Lazily created so missing/invalid env does not throw at import time (Supabase validates the URL in createClient). */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver)
  },
})
