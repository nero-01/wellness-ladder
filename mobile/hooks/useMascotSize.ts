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
        return fit(318, 276, 364, short)
      case "loading":
        return fit(224, 194, 268, short)
      case "hero":
        return fit(268, 228, 328, short)
      case "auth":
        return fit(250, 216, 308, short)
      case "taskCue":
        return fit(208, 180, 252, short)
      case "taskSession":
        return fit(174, 150, 212, short)
      case "celebration":
        return fit(272, 236, 332, short)
      case "milestone":
        return fit(246, 212, 308, short)
      case "profile":
        return fit(196, 168, 240, short)
      case "banner":
        return fit(106, 90, 124, short)
      default:
        return fit(178, 154, 224, short)
    }
  }, [width, height, preset])
}
