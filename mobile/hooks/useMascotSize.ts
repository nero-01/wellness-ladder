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
        return fit(300, 260, 348, short)
      case "loading":
        return fit(212, 184, 256, short)
      case "hero":
        return fit(252, 216, 312, short)
      case "auth":
        return fit(236, 204, 292, short)
      case "taskCue":
        return fit(196, 170, 240, short)
      case "taskSession":
        return fit(164, 142, 200, short)
      case "celebration":
        return fit(256, 224, 316, short)
      case "milestone":
        return fit(232, 200, 292, short)
      case "profile":
        return fit(184, 158, 228, short)
      case "banner":
        return fit(100, 86, 118, short)
      default:
        return fit(168, 146, 212, short)
    }
  }, [width, height, preset])
}
