import { createBrowserClient, type SupabaseClient } from "@supabase/ssr"

let client: SupabaseClient | null = null

export function getBrowserSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
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
  return !!(
    typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
    typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0
  )
}
