import { useMemo } from "react"
import { useWindowDimensions } from "react-native"

/**
 * Presets map to focal sizes on typical phones; scales with shortest screen side
 * so the mascot stays a clear hero on small devices without overwhelming tablets.
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
        return fit(188, 168, 228, short)
      case "loading":
        return fit(128, 112, 158, short)
      case "hero":
        return fit(148, 128, 188, short)
      case "auth":
        return fit(138, 122, 172, short)
      case "taskCue":
        return fit(116, 100, 138, short)
      case "taskSession":
        return fit(96, 84, 118, short)
      case "celebration":
        return fit(156, 136, 200, short)
      case "milestone":
        return fit(140, 120, 180, short)
      case "profile":
        return fit(112, 96, 136, short)
      case "banner":
        return fit(68, 60, 82, short)
      default:
        return fit(112, 96, 132, short)
    }
  }, [width, height, preset])
}
