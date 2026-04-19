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
        return fit(268, 236, 320, short)
      case "loading":
        return fit(184, 160, 224, short)
      case "hero":
        return fit(216, 188, 276, short)
      case "auth":
        return fit(204, 176, 256, short)
      case "taskCue":
        return fit(172, 150, 212, short)
      case "taskSession":
        return fit(144, 126, 180, short)
      case "celebration":
        return fit(228, 200, 288, short)
      case "milestone":
        return fit(204, 176, 256, short)
      case "profile":
        return fit(160, 138, 200, short)
      case "banner":
        return fit(92, 80, 112, short)
      default:
        return fit(148, 128, 188, short)
    }
  }, [width, height, preset])
}
