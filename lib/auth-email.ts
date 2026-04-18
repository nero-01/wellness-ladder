/**
 * Hardens addresses before Supabase Auth (which sends confirmation mail).
 * Reduces hard bounces from whitespace, casing drift, invisible chars, and common domain typos.
 */

/** Zero-width / format chars that sometimes paste into email fields and break delivery. */
const INVISIBLE_CHARS = /[\u200B-\u200D\uFEFF\u2060]/g

/**
 * Maps exact post-@ domains (already lowercased) to corrected forms that would otherwise hard-bounce.
 * Conservative list — only unambiguous typos of major providers.
 */
const KNOWN_DOMAIN_TYPOS: Record<string, string> = {
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmail.co": "gmail.com",
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmil.com": "gmail.com",
  "yahoo.con": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "hotmail.con": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "outlook.con": "outlook.com",
  "outlook.co": "outlook.com",
  "icloud.con": "icloud.com",
  "protonmail.con": "protonmail.com",
  "live.con": "live.com",
}

export function normalizeAuthEmail(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(INVISIBLE_CHARS, "")
    .trim()
    .toLowerCase()
}

function correctKnownDomainTypos(email: string): string {
  const at = email.lastIndexOf("@")
  if (at <= 0 || at === email.length - 1) return email
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  const fixed = KNOWN_DOMAIN_TYPOS[domain]
  return fixed ? `${local}@${fixed}` : email
}

/** Single pipeline for sign-in / sign-up — use this before every Supabase email call. */
export function sanitizeAuthEmailForSupabase(raw: string): string {
  return correctKnownDomainTypos(normalizeAuthEmail(raw))
}

const EMAIL_MAX = 254

/** Extra checks beyond `z.string().email()` — rejects patterns that often bounce or fail validation. */
export function isPlausibleMailbox(email: string): boolean {
  if (email.length === 0 || email.length > EMAIL_MAX) return false
  const at = email.lastIndexOf("@")
  if (at < 1 || at !== email.indexOf("@")) return false
  const local = email.slice(0, at)
  const domain = email.slice(at + 1)
  if (local.length === 0 || local.length > 64) return false
  if (domain.length === 0 || !domain.includes(".")) return false
  if (email.includes("..") || local.startsWith(".") || local.endsWith(".")) return false
  if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) return false
  const tld = domain.slice(domain.lastIndexOf(".") + 1)
  if (tld.length < 2) return false
  return true
}
