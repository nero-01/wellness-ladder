import { getDayOfYear } from "date-fns"
import type { WellnessLocale } from "@/lib/wellness-locale"
import { isWellnessPro } from "@/lib/wellness-pro"

export const SADAG_HELPLINE_PRIMARY = "0800 567 567"
export const SADAG_HELPLINE_ALT = "0800 456 789"
export const SADAG_WHATSAPP_URL = "https://wa.me/277871632030"

/** Seven bilingual tips — index `dayOfYear % 7` (stable per calendar day). */
export const SADAG_ROTATING_TIPS: { af: string; en: string }[] = [
  {
    af: "Pouseer. Asem in... uit. Jy is nie alleen nie.",
    en: "Pause. Breathe in... out. You're not alone.",
  },
  {
    af: "Noem drie dankbaarhede.",
    en: "Name 3 gratitudes.",
  },
  {
    af: "Praat met 'n vriend of SADAG: 0800 567 567.",
    en: "Talk to a friend or SADAG: 0800 567 567.",
  },
  {
    af: "Self-sorg: Eet gesond.",
    en: "Self-care: Eat healthy.",
  },
  {
    af: "Strek vir spanning.",
    en: "Stretch for tension.",
  },
  {
    af: "Journal een wen.",
    en: "Journal one win.",
  },
  {
    af: "Wees sag met jouself.",
    en: "Be kind to yourself.",
  },
]

export const SADAG_TIPS_PRO_EXTRA: { af: string; en: string }[] = [
  {
    af: "Klein stappe tel — een taak per dag.",
    en: "Small steps count — one task a day.",
  },
  {
    af: "Roep hulp uit wanneer jy dit nodig het.",
    en: "Reach out when you need support.",
  },
  {
    af: "Jy verdien rus en genade.",
    en: "You deserve rest and grace.",
  },
]

/** Rotating tip for `date` (use `new Date()` for today). Offline-first. */
export function getSadagTipForDate(
  date: Date,
  locale: WellnessLocale,
): string {
  const pro = isWellnessPro()
  const pool = pro
    ? [...SADAG_ROTATING_TIPS, ...SADAG_TIPS_PRO_EXTRA]
    : SADAG_ROTATING_TIPS
  const idx = getDayOfYear(date) % pool.length
  const row = pool[idx] ?? pool[0]!
  return locale === "af" ? row.af : row.en
}

export function formatSadagTipDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/** @deprecated Prefer getSadagTipForDate — kept for dev/legacy callers */
export function pickRandomSadagTip(): string {
  return getSadagTipForDate(new Date(), "en")
}
