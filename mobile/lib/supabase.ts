import "react-native-url-polyfill/auto"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { isLikelySupabaseJwtAnonKey } from "@/lib/anon-key"

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim()
const key =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.EXPO_PUBLIC_SUPABASE_KEY?.trim()

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
    "[wellness] Supabase key should be the anon JWT (eyJ…) or publishable (sb_publishable_…). Using mock auth until fixed.",
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

/**
 * PKCE is required for reliable OAuth / deep-link flows on React Native (session exchange).
 * See: https://supabase.com/docs/guides/auth/native-mobile-deep-linking
 */
const authOptions = {
  storage: AsyncStorage,
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  flowType: "pkce" as const,
} as const

/** Real client only when Supabase is fully configured; guard with `isSupabaseConfigured()`. */
export const supabase: SupabaseClient = isSupabaseConfigured()
  ? createClient(url!, key!, { auth: authOptions })
  : (null as unknown as SupabaseClient)

/**
 * Dev-only: logs `getSession` + `getUser()` for debugging sign-in / token issues.
 * Call after successful password or OAuth sign-in (not a substitute for Dashboard SMTP checks).
 */
export async function logSupabaseAuthDebug(context: string): Promise<void> {
  if (!__DEV__ || !isSupabaseConfigured()) return
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    // eslint-disable-next-line no-console
    console.log(`[Supabase auth debug:${context}]`, {
      hasSession: !!session,
      userId: user?.id,
      email: user?.email,
      getUserError: error?.message ?? null,
    })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`[Supabase auth debug:${context}]`, e)
  }
}
