import { format } from "date-fns"
import { isWellnessPro } from "@/lib/wellness-pro"

export const SADAG_TIPS_FREE = [
  "Praat met 'n vriend",
  "Roep hulp uit—SADAG is daar",
  "Klein stappe tel",
  "Jy is nie alleen nie",
] as const

/** Pro-only extra wellness tips (Afrikaans). */
export const SADAG_TIPS_PRO = [
  "Neem 'n oomblik om te asemhaal voor jy antwoord gee",
  "Skryf een woord neer wat vandag vir jou saak maak",
  "Selfs 60 sekondes rus kan jou dag ligter maak",
] as const

export const SADAG_HELPLINE_PRIMARY = "0800 567 567"
export const SADAG_HELPLINE_ALT = "0800 456 789"
export const SADAG_WHATSAPP_URL = "https://wa.me/27800121214"

/** Random tip per completion (offline); Pro includes the extended pool. */
export function pickRandomSadagTip(): string {
  const pro = isWellnessPro()
  const pool = pro
    ? [...SADAG_TIPS_FREE, ...SADAG_TIPS_PRO]
    : [...SADAG_TIPS_FREE]
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx] ?? pool[0]!
}

/** date-fns — used on the post-done screen for a stable “today” line. */
export function formatSadagTipDate(): string {
  return format(new Date(), "d MMMM yyyy")
}
