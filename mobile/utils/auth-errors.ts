/** Supabase / GoTrue rate limits and email send caps */
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
