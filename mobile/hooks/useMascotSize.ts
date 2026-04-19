import { useMemo } from "react"
import { useWindowDimensions } from "react-native"

/**
 * Presets are **rendered width** (px) for the mascot bitmap — height follows asset aspect in `Mascot`.
 * Scales with shortest screen side so the mascot stays a clear focal point on all devices.
 */
export type MascotSizePreset =
  | "splash"
  | "loading"
  | "hero"
  | "auth"
  | "taskCue"
  | "taskSession"
  | "celebration"
  | "milestone"
  | "profile"
  | "banner"

const REF_SHORT = 390

function fit(base: number, min: number, max: number, shortSide: number): number {
  const scale = Math.min(1.12, Math.max(0.88, shortSide / REF_SHORT))
  return Math.round(Math.min(max, Math.max(min, base * scale)))
}

export function useMascotSize(preset: MascotSizePreset): number {
  const { width, height } = useWindowDimensions()
  return useMemo(() => {
    const short = Math.min(width, height)
    switch (preset) {
      case "splash":
        return fit(348, 300, 392, short)
      case "loading":
        return fit(244, 210, 292, short)
      case "hero":
        return fit(292, 250, 352, short)
      case "auth":
        return fit(274, 236, 332, short)
      case "taskCue":
        return fit(228, 196, 276, short)
      case "taskSession":
        return fit(190, 164, 232, short)
      case "celebration":
        return fit(296, 256, 356, short)
      case "milestone":
        return fit(268, 230, 332, short)
      case "profile":
        return fit(214, 184, 260, short)
      case "banner":
        return fit(112, 96, 132, short)
      default:
        return fit(196, 168, 248, short)
    }
  }, [width, height, preset])
}
