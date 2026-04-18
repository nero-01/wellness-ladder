/**
 * Template-friendly re-export — the real client lives in `lib/supabase.ts`
 * (Expo env, mock-auth fallback, JWT/publishable key checks).
 *
 * Usage: `import { supabase, isSupabaseConfigured } from "@/utils/supabase"`
 */
export { isSupabaseConfigured, supabase } from "@/lib/supabase"
