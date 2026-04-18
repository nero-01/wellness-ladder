/** Shared with mobile `utils/auth-errors.ts` — keep messages aligned. */

export function isAuthRateLimitError(message: string): boolean {
  const m = message.toLowerCase()
  return (
    m.includes("rate limit") ||
    m.includes("too many") ||
    m.includes("over_email_send") ||
    m.includes("email rate limit") ||
    m.includes("429") ||
    /for security purposes/i.test(m)
  )
}

export function mapSupabaseAuthError(error: { message?: string }): Error {
  const msg = error.message ?? "Auth request failed"
  if (isAuthRateLimitError(msg)) {
    return new Error(
      "Email rate limit exceeded. Wait an hour or use another inbox. For local dev: Supabase Dashboard → Authentication → Providers → Email → turn off “Confirm email” so sign-up does not send mail.",
    )
  }
  return error instanceof Error ? error : new Error(msg)
}
