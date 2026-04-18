/**
 * Public Supabase client keys: legacy anon JWT (`eyJ…`) or publishable (`sb_publishable_…`).
 */
export function isLikelySupabaseJwtAnonKey(key: string | undefined): boolean {
  const k = key?.trim()
  if (!k) return false
  return k.startsWith("eyJ") || k.startsWith("sb_publishable_")
}
