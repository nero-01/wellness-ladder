/**
 * Wellness companion mascot (Milo) — expression states.
 * Raster art: `assets/mascot/mascot-transparent.png` (RGBA). Motion is driven in `Mascot.tsx`.
 * Mood picker maps user choices to these via `lib/milo-mood.ts`.
 */
export type MascotState =
  | "idle"
  /** Task / walk in progress — steady, present */
  | "focused"
  | "encouraging"
  | "celebrating"
  | "sleepy"
  | "proud"
  | "supportive"
  /** Thoughtful, slow — Milo mood: Reflective */
  | "reflective"
  /** Gentle concern — Milo mood: Stressed (soft motion, never harsh) */
  | "stressed"

export type MascotLocale = "en" | "af"

const LABELS_EN: Record<MascotState, string> = {
  idle: "Calm wellness companion",
  focused: "Wellness companion, here with you while you focus",
  encouraging: "Friendly wellness companion, cheering you on gently",
  celebrating: "Wellness companion, sharing a quiet moment of joy with you",
  sleepy: "Wellness companion, resting — a soft reminder for later",
  proud: "Wellness companion, gently happy with your progress",
  supportive: "Wellness companion, here with you",
  reflective: "Wellness companion, pausing with you in a quiet moment",
  stressed: "Wellness companion, staying gently beside you",
}

const LABELS_AF: Record<MascotState, string> = {
  idle: "Kalm welstand-metgesel",
  focused: "Welstand-metgesel is hier by jou terwyl jy fokus",
  encouraging: "Vriendelike welstand-metgesel moedig jou sag aan",
  celebrating: "Welstand-metgesel deel stil vreugde met jou",
  sleepy: "Welstand-metgesel rus — sagte herinnering vir later",
  proud: "Welstand-metgesel is sag gelukkig met jou vordering",
  supportive: "Welstand-metgesel is hier by jou",
  reflective: "Welstand-metgesel stilstaan met jou in ’n stil oomblik",
  stressed: "Welstand-metgesel bly sag by jou",
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
  focused: { float: 0.88, blink: 0.95 },
  encouraging: { float: 1.05, blink: 1 },
  celebrating: { float: 0.75, blink: 0.65 },
  sleepy: { float: 0.55, blink: 0.35 },
  proud: { float: 0.9, blink: 0.85 },
  supportive: { float: 0.88, blink: 1 },
  reflective: { float: 0.7, blink: 0.6 },
  stressed: { float: 0.65, blink: 1.05 },
} as const
