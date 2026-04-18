/** Re-export shared auth email helpers for Metro (`@/lib/*`). */
export {
  isPlausibleMailbox,
  normalizeAuthEmail,
  sanitizeAuthEmailForSupabase,
} from "../../lib/auth-email"
