/** Dark wellness landing palette — aligned with web `app/page.tsx` + globals dark theme */

import {
  moodPastelsDark,
  moodPastelsLight,
  type MoodPastelSet,
} from "../../lib/mood-pastels"

export type { MoodPastelSet }

export type WellnessPalette = {
  bg: string
  bgElevated: string
  card: string
  cardBorder: string
  text: string
  textMuted: string
  primary: string
  primaryPressed: string
  iconBg: string
  logoBgFrom: string
  logoBgTo: string
  /** Progress ring / timer track (muted) */
  ringTrack: string
  surfaceMuted: string
  timerTrack: string
  /** Soft mood-only accents — use sparingly (`lib/mood-pastels.ts`) */
  moodPastels: MoodPastelSet
}

export const WellnessColors: WellnessPalette = {
  bg: "#151118",
  bgElevated: "#1f1c22",
  card: "rgba(255, 255, 255, 0.07)",
  cardBorder: "rgba(255, 255, 255, 0.08)",
  text: "#fafafa",
  textMuted: "#a8a4b0",
  primary: "#8b5cf6",
  primaryPressed: "#7c3aed",
  iconBg: "rgba(139, 92, 246, 0.15)",
  logoBgFrom: "#7c3aed",
  logoBgTo: "#6d28d9",
  ringTrack: "rgba(255, 255, 255, 0.12)",
  surfaceMuted: "rgba(255, 255, 255, 0.06)",
  timerTrack: "rgba(255, 255, 255, 0.1)",
  moodPastels: moodPastelsDark,
}

/** Light palette — used when system Appearance is light */
export const WellnessColorsLight: WellnessPalette = {
  bg: "#fafafa",
  bgElevated: "#ffffff",
  card: "rgba(0, 0, 0, 0.04)",
  cardBorder: "rgba(0, 0, 0, 0.08)",
  text: "#18181b",
  textMuted: "#71717a",
  primary: "#7c3aed",
  primaryPressed: "#6d28d9",
  iconBg: "rgba(124, 58, 237, 0.12)",
  logoBgFrom: "#7c3aed",
  logoBgTo: "#6d28d9",
  ringTrack: "rgba(0, 0, 0, 0.1)",
  surfaceMuted: "rgba(0, 0, 0, 0.06)",
  timerTrack: "rgba(0, 0, 0, 0.08)",
  moodPastels: moodPastelsLight,
}
