/**
 * Supabase Auth (GoTrue) expects the legacy **anon public JWT** from
 * Dashboard → Settings → API (starts with `eyJ`).
 * Publishable keys (`sb_publishable_…`) are not valid for password sign-in.
 */
export function isLikelySupabaseJwtAnonKey(key: string | undefined): boolean {
  const k = key?.trim()
  if (!k) return false
  return k.startsWith("eyJ")
}
