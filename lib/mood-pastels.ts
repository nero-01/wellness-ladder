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
  /** Label tint on selected (readable on fill) */
  label: string
  /**
   * Solid tint for tab icons, nav chips, and inline accents (readable on neutral bg).
   */
  navIcon: string
}

export type MoodPastelSet = Record<MoodPastelKey, MoodPastelAccent>

/** Main tab order: Home, Task, Progress — distinct hues while navigating */
export const NAV_TAB_PASTEL_KEYS: readonly MoodPastelKey[] = [
  "lavender",
  "mint",
  "warmPeach",
]

/** Feature grid / marketing tiles — cycles the palette without crowding one screen */
export const FEATURE_TILE_PASTEL_KEYS: readonly MoodPastelKey[] = [
  "lavender",
  "softYellow",
  "mint",
  "paleSky",
]

/** Dark UI — pastels must be strong enough to read on near-black bg */
export const moodPastelsDark: MoodPastelSet = {
  lavender: {
    idleFill: "rgba(186, 174, 230, 0.17)",
    idleBorder: "rgba(167, 139, 250, 0.45)",
    fill: "rgba(186, 174, 230, 0.38)",
    border: "rgba(186, 174, 250, 0.82)",
    label: "#e9e4f8",
    navIcon: "#c4b5fd",
  },
  softYellow: {
    idleFill: "rgba(250, 230, 150, 0.14)",
    idleBorder: "rgba(234, 200, 90, 0.48)",
    fill: "rgba(250, 235, 170, 0.32)",
    border: "rgba(245, 210, 100, 0.78)",
    label: "#faf6d9",
    navIcon: "#fde68a",
  },
  mint: {
    idleFill: "rgba(150, 230, 200, 0.15)",
    idleBorder: "rgba(110, 200, 170, 0.48)",
    fill: "rgba(150, 230, 200, 0.32)",
    border: "rgba(120, 220, 185, 0.80)",
    label: "#d9f5e9",
    navIcon: "#86efac",
  },
  softPink: {
    idleFill: "rgba(244, 190, 210, 0.16)",
    idleBorder: "rgba(230, 150, 175, 0.45)",
    fill: "rgba(244, 200, 220, 0.32)",
    border: "rgba(240, 170, 200, 0.76)",
    label: "#fce8f0",
    navIcon: "#f9a8d4",
  },
  paleSky: {
    idleFill: "rgba(160, 215, 250, 0.15)",
    idleBorder: "rgba(120, 195, 235, 0.45)",
    fill: "rgba(165, 220, 250, 0.30)",
    border: "rgba(130, 205, 245, 0.78)",
    label: "#e0f4fe",
    navIcon: "#7dd3fc",
  },
  warmPeach: {
    idleFill: "rgba(245, 200, 175, 0.16)",
    idleBorder: "rgba(230, 165, 135, 0.45)",
    fill: "rgba(245, 210, 190, 0.32)",
    border: "rgba(235, 175, 145, 0.76)",
    label: "#fff0e8",
    navIcon: "#fdba74",
  },
}

/** Light UI — slightly softer fills, stronger borders for definition */
export const moodPastelsLight: MoodPastelSet = {
  lavender: {
    idleFill: "rgba(196, 181, 253, 0.28)",
    idleBorder: "rgba(167, 139, 250, 0.52)",
    fill: "rgba(196, 181, 253, 0.48)",
    border: "rgba(139, 92, 246, 0.58)",
    label: "#5b21b6",
    navIcon: "#7c3aed",
  },
  softYellow: {
    idleFill: "rgba(254, 249, 195, 0.72)",
    idleBorder: "rgba(234, 200, 90, 0.58)",
    fill: "rgba(254, 249, 195, 0.95)",
    border: "rgba(202, 165, 40, 0.58)",
    label: "#713f12",
    navIcon: "#a16207",
  },
  mint: {
    idleFill: "rgba(190, 240, 215, 0.52)",
    idleBorder: "rgba(110, 200, 170, 0.55)",
    fill: "rgba(190, 240, 215, 0.82)",
    border: "rgba(45, 160, 120, 0.52)",
    label: "#14532d",
    navIcon: "#15803d",
  },
  softPink: {
    idleFill: "rgba(252, 215, 230, 0.56)",
    idleBorder: "rgba(236, 160, 190, 0.55)",
    fill: "rgba(252, 215, 230, 0.88)",
    border: "rgba(219, 100, 150, 0.50)",
    label: "#831843",
    navIcon: "#be185d",
  },
  paleSky: {
    idleFill: "rgba(190, 230, 252, 0.54)",
    idleBorder: "rgba(120, 195, 235, 0.55)",
    fill: "rgba(190, 230, 252, 0.88)",
    border: "rgba(56, 170, 220, 0.52)",
    label: "#0c4a6e",
    navIcon: "#0369a1",
  },
  warmPeach: {
    idleFill: "rgba(255, 225, 205, 0.62)",
    idleBorder: "rgba(230, 165, 135, 0.55)",
    fill: "rgba(255, 225, 205, 0.92)",
    border: "rgba(220, 130, 90, 0.52)",
    label: "#7c2d12",
    navIcon: "#c2410c",
  },
}

export function moodPastelAccent(
  set: MoodPastelSet,
  key: MoodPastelKey,
): MoodPastelAccent {
  return set[key]
}
