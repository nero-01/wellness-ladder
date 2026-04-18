import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"
import { isLikelySupabaseJwtAnonKey } from "@/lib/supabase/anon-key"

let client: SupabaseClient | null = null

export function getBrowserSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key || !isLikelySupabaseJwtAnonKey(key)) return null
  if (!client) {
    client = createBrowserClient(url, key)
  }
  return client
}

/**
 * When `NEXT_PUBLIC_USE_MOCK_AUTH=true`, the web app uses client-only mock auth
 * (see `lib/auth.tsx`) even if Supabase URL/key are set — useful for UI dev before
 * real users exist in Supabase.
 */
export function isSupabaseConfigured(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_AUTH === "true") {
    return false
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (
    typeof url !== "string" ||
    url.length === 0 ||
    typeof key !== "string" ||
    key.length === 0
  ) {
    return false
  }
  // Publishable-style keys (sb_…) are not valid for GoTrue; use mock auth or JWT anon key.
  return isLikelySupabaseJwtAnonKey(key)
}
