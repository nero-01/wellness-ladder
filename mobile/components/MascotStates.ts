/**
 * Wellness companion mascot — expression states (minimal set).
 * Keep in sync with `Mascot.tsx` face/body rendering.
 */
export type MascotState =
  | "idle"
  | "encouraging"
  | "celebrating"
  | "sleepy"
  | "proud"
  | "supportive"

export type MascotLocale = "en" | "af"

const LABELS_EN: Record<MascotState, string> = {
  idle: "Wellness companion, calm",
  encouraging: "Wellness companion, encouraging you",
  celebrating: "Wellness companion, celebrating with you",
  sleepy: "Wellness companion, gentle reminder",
  proud: "Wellness companion, proud of your streak",
  supportive: "Wellness companion, here to support you",
}

const LABELS_AF: Record<MascotState, string> = {
  idle: "Welstand-metgesel, kalm",
  encouraging: "Welstand-metgesel moedig jou aan",
  celebrating: "Welstand-metgesel vier saam met jou",
  sleepy: "Welstand-metgesel, sagte herinnering",
  proud: "Welstand-metgesel, trots op jou streep",
  supportive: "Welstand-metgesel, hier om jou te ondersteun",
}

export function mascotAccessibilityLabel(
  state: MascotState,
  locale: MascotLocale = "en",
): string {
  return locale === "af" ? LABELS_AF[state] : LABELS_EN[state]
}

/** Motion intensity multipliers — used by `Mascot` for subtle variation */
export const MASCOT_MOTION = {
  idle: { float: 1, blink: 1 },
  encouraging: { float: 1.15, blink: 1 },
  celebrating: { float: 0.6, blink: 0.5 },
  sleepy: { float: 0.5, blink: 0.3 },
  proud: { float: 0.85, blink: 0.8 },
  supportive: { float: 0.9, blink: 1 },
} as const
