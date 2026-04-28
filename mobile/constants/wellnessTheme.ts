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
  /** Dark palette: deep background + high-contrast off-white text */
  bg: "#151827",
  bgElevated: "#1B2135",
  card: "rgba(27, 33, 53, 0.94)",
  cardBorder: "rgba(241, 239, 229, 0.16)",
  text: "#F5F7FF",
  textMuted: "rgba(245, 247, 255, 0.82)",
  primary: "#7A8BFF",
  primaryPressed: "#6C7EF5",
  iconBg: "rgba(122, 139, 255, 0.18)",
  logoBgFrom: "#5B6DDB",
  logoBgTo: "#5365D3",
  ringTrack: "rgba(245, 247, 255, 0.2)",
  surfaceMuted: "rgba(122, 139, 255, 0.12)",
  timerTrack: "rgba(122, 139, 255, 0.2)",
  moodPastels: moodPastelsDark,
}

/** Light palette — used when system Appearance is light */
export const WellnessColorsLight: WellnessPalette = {
  bg: "#F6F8FF",
  bgElevated: "#FFFFFF",
  card: "rgba(255, 255, 255, 0.95)",
  cardBorder: "rgba(91, 109, 219, 0.18)",
  text: "#111827",
  textMuted: "rgba(17, 24, 39, 0.72)",
  primary: "#5B6DDB",
  primaryPressed: "#5365D3",
  iconBg: "rgba(91, 109, 219, 0.12)",
  logoBgFrom: "#5B6DDB",
  logoBgTo: "#5365D3",
  ringTrack: "rgba(36, 47, 120, 0.16)",
  surfaceMuted: "rgba(91, 109, 219, 0.08)",
  timerTrack: "rgba(36, 47, 120, 0.12)",
  moodPastels: moodPastelsLight,
}
