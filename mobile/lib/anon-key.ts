/**
 * Public client keys Supabase may show in the dashboard:
 * - Legacy anon JWT (`eyJ…`)
 * - Publishable key (`sb_publishable_…`) — use with current `@supabase/supabase-js`
 *
 * Some auth flows still expect the JWT; if sign-in fails, switch to the anon JWT.
 */
export function isLikelySupabaseJwtAnonKey(key: string | undefined): boolean {
  const k = key?.trim()
  if (!k) return false
  return k.startsWith("eyJ") || k.startsWith("sb_publishable_")
}
