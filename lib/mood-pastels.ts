/**
 * Restrained pastel accents for mood UI only — low saturation, minimal use.
 * Paired fill + border for subtle cards and selection states.
 */

export type MoodPastelKey =
  | "lavender"
  | "softYellow"
  | "mint"
  | "softPink"
  | "paleSky"
  | "warmPeach"

export type MoodPastelAccent = {
  fill: string
  border: string
}

export type MoodPastelSet = Record<MoodPastelKey, MoodPastelAccent>

/** Dark surfaces — very low-opacity fills so text stays readable */
export const moodPastelsDark: MoodPastelSet = {
  lavender: {
    fill: "rgba(186, 174, 230, 0.10)",
    border: "rgba(167, 139, 250, 0.32)",
  },
  softYellow: {
    fill: "rgba(250, 240, 185, 0.09)",
    border: "rgba(234, 200, 90, 0.28)",
  },
  mint: {
    fill: "rgba(165, 230, 205, 0.10)",
    border: "rgba(110, 200, 170, 0.30)",
  },
  softPink: {
    fill: "rgba(244, 200, 220, 0.10)",
    border: "rgba(230, 160, 185, 0.28)",
  },
  paleSky: {
    fill: "rgba(175, 220, 245, 0.10)",
    border: "rgba(120, 195, 235, 0.30)",
  },
  warmPeach: {
    fill: "rgba(245, 210, 190, 0.11)",
    border: "rgba(230, 165, 135, 0.28)",
  },
}

/** Light surfaces — slightly stronger for visibility on white */
export const moodPastelsLight: MoodPastelSet = {
  lavender: {
    fill: "rgba(196, 181, 253, 0.28)",
    border: "rgba(167, 139, 250, 0.42)",
  },
  softYellow: {
    fill: "rgba(254, 249, 195, 0.55)",
    border: "rgba(234, 200, 90, 0.45)",
  },
  mint: {
    fill: "rgba(190, 240, 215, 0.40)",
    border: "rgba(110, 200, 170, 0.42)",
  },
  softPink: {
    fill: "rgba(252, 215, 230, 0.45)",
    border: "rgba(236, 160, 190, 0.42)",
  },
  paleSky: {
    fill: "rgba(190, 230, 252, 0.45)",
    border: "rgba(120, 195, 235, 0.42)",
  },
  warmPeach: {
    fill: "rgba(255, 225, 205, 0.50)",
    border: "rgba(230, 165, 135, 0.42)",
  },
}

export function moodPastelAccent(
  set: MoodPastelSet,
  key: MoodPastelKey,
): MoodPastelAccent {
  return set[key]
}
