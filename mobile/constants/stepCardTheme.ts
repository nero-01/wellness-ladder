import { Platform, type ViewStyle } from "react-native"

/**
 * Silent Moon–inspired ladder step surfaces (solid fills, soft contrast).
 * Reference: calm purple / coral / cream / mint — large radius, no harsh strokes.
 */
export type StepCardSurface = {
  bg: string
  fg: string
  fgMuted: string
  /** Soft highlight circle (top-right) */
  blob: string
}

/** Cycles with task id — Gratitude (id 2) lands on warm coral. */
export const SILENT_MOON_STEP_SURFACES: StepCardSurface[] = [
  {
    bg: "#8E97FD",
    fg: "#FFFFFF",
    fgMuted: "rgba(255,255,255,0.78)",
    blob: "rgba(255,255,255,0.22)",
  },
  {
    bg: "#FEA07E",
    fg: "#FFFFFF",
    fgMuted: "rgba(255,255,255,0.8)",
    blob: "rgba(255,255,255,0.2)",
  },
  {
    bg: "#AFE5DA",
    fg: "#1E3D36",
    fgMuted: "rgba(30,61,54,0.72)",
    blob: "rgba(255,255,255,0.45)",
  },
  {
    bg: "#C4B5FD",
    fg: "#2D2640",
    fgMuted: "rgba(45,38,64,0.7)",
    blob: "rgba(255,255,255,0.35)",
  },
  {
    bg: "#FFDB9D",
    fg: "#3D3428",
    fgMuted: "rgba(61,52,40,0.72)",
    blob: "rgba(255,255,255,0.5)",
  },
  {
    bg: "#B8C5FF",
    fg: "#252047",
    fgMuted: "rgba(37,32,71,0.72)",
    blob: "rgba(255,255,255,0.35)",
  },
]

export function stepSurfaceForTaskId(taskId: number): StepCardSurface {
  if (!Number.isFinite(taskId) || taskId < 1) return SILENT_MOON_STEP_SURFACES[0]
  return SILENT_MOON_STEP_SURFACES[(taskId - 1) % SILENT_MOON_STEP_SURFACES.length]
}

/** Diffused lift — lighter than default app cards, matches reference “float”. */
export const silentMoonLiftShadow: ViewStyle = {
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.09,
      shadowRadius: 22,
    },
    android: { elevation: 4 },
    default: {},
  }),
}

export function stepMonogramLetter(taskTitle: string): string {
  const t = taskTitle.trim()
  if (!t) return "·"
  const ch = t.charAt(0)
  return /[a-zA-Z]/.test(ch) ? ch.toUpperCase() : "·"
}
