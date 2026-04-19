/**
 * Mood-only pastel accents — noticeable but soft; paired idle + selected tiers.
 * Dark theme uses higher-opacity fills so colors read on #151118-style surfaces.
 */

export type MoodPastelKey =
  | "lavender"
  | "softYellow"
  | "mint"
  | "softPink"
  | "paleSky"
  | "warmPeach"

/** Selected / emphasis — full card fill + border */
export type MoodPastelAccent = {
  /** Unselected card: visible color identity (still soft) */
  idleFill: string
  idleBorder: string
  /** Selected card: clearly tinted */
  fill: string
  border: string
  /** Optional label tint on selected (readable on fill) */
  label: string
}

export type MoodPastelSet = Record<MoodPastelKey, MoodPastelAccent>

/** Dark UI — pastels must be strong enough to read on near-black bg */
export const moodPastelsDark: MoodPastelSet = {
  lavender: {
    idleFill: "rgba(186, 174, 230, 0.12)",
    idleBorder: "rgba(167, 139, 250, 0.38)",
    fill: "rgba(186, 174, 230, 0.32)",
    border: "rgba(186, 174, 250, 0.78)",
    label: "#e9e4f8",
  },
  softYellow: {
    idleFill: "rgba(250, 230, 150, 0.10)",
    idleBorder: "rgba(234, 200, 90, 0.42)",
    fill: "rgba(250, 235, 170, 0.28)",
    border: "rgba(245, 210, 100, 0.72)",
    label: "#faf6d9",
  },
  mint: {
    idleFill: "rgba(150, 230, 200, 0.11)",
    idleBorder: "rgba(110, 200, 170, 0.42)",
    fill: "rgba(150, 230, 200, 0.26)",
    border: "rgba(120, 220, 185, 0.75)",
    label: "#d9f5e9",
  },
  softPink: {
    idleFill: "rgba(244, 190, 210, 0.12)",
    idleBorder: "rgba(230, 150, 175, 0.40)",
    fill: "rgba(244, 200, 220, 0.28)",
    border: "rgba(240, 170, 200, 0.72)",
    label: "#fce8f0",
  },
  paleSky: {
    idleFill: "rgba(160, 215, 250, 0.11)",
    idleBorder: "rgba(120, 195, 235, 0.40)",
    fill: "rgba(165, 220, 250, 0.26)",
    border: "rgba(130, 205, 245, 0.75)",
    label: "#e0f4fe",
  },
  warmPeach: {
    idleFill: "rgba(245, 200, 175, 0.12)",
    idleBorder: "rgba(230, 165, 135, 0.40)",
    fill: "rgba(245, 210, 190, 0.28)",
    border: "rgba(235, 175, 145, 0.72)",
    label: "#fff0e8",
  },
}

/** Light UI — slightly softer fills, stronger borders for definition */
export const moodPastelsLight: MoodPastelSet = {
  lavender: {
    idleFill: "rgba(196, 181, 253, 0.22)",
    idleBorder: "rgba(167, 139, 250, 0.45)",
    fill: "rgba(196, 181, 253, 0.42)",
    border: "rgba(139, 92, 246, 0.55)",
    label: "#5b21b6",
  },
  softYellow: {
    idleFill: "rgba(254, 249, 195, 0.65)",
    idleBorder: "rgba(234, 200, 90, 0.55)",
    fill: "rgba(254, 249, 195, 0.92)",
    border: "rgba(202, 165, 40, 0.55)",
    label: "#713f12",
  },
  mint: {
    idleFill: "rgba(190, 240, 215, 0.45)",
    idleBorder: "rgba(110, 200, 170, 0.50)",
    fill: "rgba(190, 240, 215, 0.75)",
    border: "rgba(45, 160, 120, 0.48)",
    label: "#14532d",
  },
  softPink: {
    idleFill: "rgba(252, 215, 230, 0.50)",
    idleBorder: "rgba(236, 160, 190, 0.50)",
    fill: "rgba(252, 215, 230, 0.82)",
    border: "rgba(219, 100, 150, 0.45)",
    label: "#831843",
  },
  paleSky: {
    idleFill: "rgba(190, 230, 252, 0.48)",
    idleBorder: "rgba(120, 195, 235, 0.50)",
    fill: "rgba(190, 230, 252, 0.82)",
    border: "rgba(56, 170, 220, 0.48)",
    label: "#0c4a6e",
  },
  warmPeach: {
    idleFill: "rgba(255, 225, 205, 0.55)",
    idleBorder: "rgba(230, 165, 135, 0.50)",
    fill: "rgba(255, 225, 205, 0.88)",
    border: "rgba(220, 130, 90, 0.48)",
    label: "#7c2d12",
  },
}

export function moodPastelAccent(
  set: MoodPastelSet,
  key: MoodPastelKey,
): MoodPastelAccent {
  return set[key]
}
