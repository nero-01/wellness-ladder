/** Dark wellness landing palette — aligned with web `app/page.tsx` + globals dark theme */
/** Layout rhythm (insets, radii, padding): `mobile/constants/layoutTokens.ts` */

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
  /** Latest splash refs: lavender bg + indigo CTA + warm white text */
  bg: "#8E91EC",
  bgElevated: "#9DA0EF",
  card: "rgba(241, 239, 229, 0.24)",
  cardBorder: "rgba(241, 239, 229, 0.32)",
  text: "#F1EFE5",
  textMuted: "rgba(241, 239, 229, 0.78)",
  primary: "#5B6DDB",
  primaryPressed: "#5365D3",
  iconBg: "rgba(91, 109, 219, 0.18)",
  logoBgFrom: "#5B6DDB",
  logoBgTo: "#5365D3",
  ringTrack: "rgba(241, 239, 229, 0.24)",
  surfaceMuted: "rgba(36, 47, 120, 0.22)",
  timerTrack: "rgba(36, 47, 120, 0.18)",
  moodPastels: moodPastelsDark,
}

/** Light palette — used when system Appearance is light */
export const WellnessColorsLight: WellnessPalette = {
  bg: "#8E91EC",
  bgElevated: "#B2B4F2",
  card: "rgba(241, 239, 229, 0.44)",
  cardBorder: "rgba(91, 109, 219, 0.2)",
  text: "#F1EFE5",
  textMuted: "rgba(241, 239, 229, 0.8)",
  primary: "#5B6DDB",
  primaryPressed: "#5365D3",
  iconBg: "rgba(91, 109, 219, 0.12)",
  logoBgFrom: "#5B6DDB",
  logoBgTo: "#5365D3",
  ringTrack: "rgba(36, 47, 120, 0.18)",
  surfaceMuted: "rgba(36, 47, 120, 0.08)",
  timerTrack: "rgba(36, 47, 120, 0.12)",
  moodPastels: moodPastelsLight,
}
