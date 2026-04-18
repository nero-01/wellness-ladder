/**
 * Client-only guard: Supabase sends a confirmation email on each `signUp` call.
 * Throttle repeat attempts for the same address to reduce accidental email spam.
 */

export const EMAIL_SIGNUP_COOLDOWN_MS = 15 * 60 * 1000

const STORAGE_KEY = "wellness_email_confirm_pending_v1"

function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase()
}

export function getSignupCooldownRemainingMs(email: string): number {
  if (typeof window === "undefined") return 0
  const normalized = normalizeEmailKey(email)
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return 0
  try {
    const { email: stored, ts } = JSON.parse(raw) as { email: string; ts: number }
    if (normalizeEmailKey(stored) !== normalized) return 0
    const left = EMAIL_SIGNUP_COOLDOWN_MS - (Date.now() - ts)
    return left > 0 ? left : 0
  } catch {
    return 0
  }
}

export function recordEmailConfirmationSent(email: string): void {
  if (typeof window === "undefined") return
  sessionStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ email: normalizeEmailKey(email), ts: Date.now() }),
  )
}

export function clearEmailConfirmationCooldown(): void {
  if (typeof window === "undefined") return
  sessionStorage.removeItem(STORAGE_KEY)
}

/** Restore "awaiting confirmation" UI after refresh if still inside cooldown. */
export function getStoredPendingConfirmationEmail(): string | null {
  if (typeof window === "undefined") return null
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const { email, ts } = JSON.parse(raw) as { email: string; ts: number }
    if (Date.now() - ts > EMAIL_SIGNUP_COOLDOWN_MS) {
      sessionStorage.removeItem(STORAGE_KEY)
      return null
    }
    return email
  } catch {
    return null
  }
}

export function formatCooldownWait(ms: number): string {
  const m = Math.ceil(ms / 60000)
  const s = Math.ceil((ms % 60000) / 1000)
  if (m <= 1 && s < 60) return `${s}s`
  return `${m} min`
}
