import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useAppTheme } from "@/contexts/ThemeContext"

export function useWellnessColors(): WellnessPalette {
  const { colors } = useAppTheme()
  return colors
}
