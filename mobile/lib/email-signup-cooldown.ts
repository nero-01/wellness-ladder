/**
 * Same policy as web `lib/email-signup-cooldown.ts` — AsyncStorage for Expo.
 */

import AsyncStorage from "@react-native-async-storage/async-storage"

export const EMAIL_SIGNUP_COOLDOWN_MS = 15 * 60 * 1000

const STORAGE_KEY = "@wellness_email_confirm_pending_v1"

function normalizeEmailKey(email: string): string {
  return email.trim().toLowerCase()
}

export async function getSignupCooldownRemainingMs(email: string): Promise<number> {
  const normalized = normalizeEmailKey(email)
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
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

export async function recordEmailConfirmationSent(email: string): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ email: normalizeEmailKey(email), ts: Date.now() }),
  )
}

export async function clearEmailConfirmationCooldown(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY)
}

export async function getStoredPendingConfirmationEmail(): Promise<string | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const { email, ts } = JSON.parse(raw) as { email: string; ts: number }
    if (Date.now() - ts > EMAIL_SIGNUP_COOLDOWN_MS) {
      await AsyncStorage.removeItem(STORAGE_KEY)
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

/** Throttle `auth.resend` so "Resend email" does not spam the inbox. */
export const RESEND_CONFIRMATION_COOLDOWN_MS = 60 * 1000

const RESEND_STORAGE_KEY = "@wellness_email_resend_ts_v1"

export async function getResendCooldownRemainingMs(email: string): Promise<number> {
  const normalized = normalizeEmailKey(email)
  const raw = await AsyncStorage.getItem(RESEND_STORAGE_KEY)
  if (!raw) return 0
  try {
    const { email: stored, ts } = JSON.parse(raw) as { email: string; ts: number }
    if (normalizeEmailKey(stored) !== normalized) return 0
    const left = RESEND_CONFIRMATION_COOLDOWN_MS - (Date.now() - ts)
    return left > 0 ? left : 0
  } catch {
    return 0
  }
}

export async function recordResendConfirmationAttempt(email: string): Promise<void> {
  await AsyncStorage.setItem(
    RESEND_STORAGE_KEY,
    JSON.stringify({ email: normalizeEmailKey(email), ts: Date.now() }),
  )
}

export function formatResendWait(ms: number): string {
  const s = Math.max(1, Math.ceil(ms / 1000))
  return `${s}s`
}
