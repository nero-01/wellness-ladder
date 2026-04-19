/**
 * Wellness companion mascot — expression states (minimal set).
 * Raster art: `assets/mascot/wellness-splash-companion.png`. Motion is driven in `Mascot.tsx`
 * (float, blink, nod, celebrate, proud pulse, optional `attentionKey` / `rewardKey`).
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
  idle: "Calm wellness companion",
  encouraging: "Friendly wellness companion, cheering you on gently",
  celebrating: "Wellness companion, sharing a quiet moment of joy with you",
  sleepy: "Wellness companion, resting — a soft reminder for later",
  proud: "Wellness companion, gently happy with your progress",
  supportive: "Wellness companion, here with you",
}

const LABELS_AF: Record<MascotState, string> = {
  idle: "Kalm welstand-metgesel",
  encouraging: "Vriendelike welstand-metgesel moedig jou sag aan",
  celebrating: "Welstand-metgesel deel stil vreugde met jou",
  sleepy: "Welstand-metgesel rus — sagte herinnering vir later",
  proud: "Welstand-metgesel is sag gelukkig met jou vordering",
  supportive: "Welstand-metgesel is hier by jou",
}

export function mascotAccessibilityLabel(
  state: MascotState,
  locale: MascotLocale = "en",
): string {
  return locale === "af" ? LABELS_AF[state] : LABELS_EN[state]
}

/** Motion intensity — keep low for calm, approachable motion */
export const MASCOT_MOTION = {
  idle: { float: 1, blink: 1 },
  encouraging: { float: 1.05, blink: 1 },
  celebrating: { float: 0.75, blink: 0.65 },
  sleepy: { float: 0.55, blink: 0.35 },
  proud: { float: 0.9, blink: 0.85 },
  supportive: { float: 0.88, blink: 1 },
} as const
