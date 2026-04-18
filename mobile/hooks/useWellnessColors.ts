import { useColorScheme } from "@/components/useColorScheme"
import {
  WellnessColors,
  WellnessColorsLight,
  type WellnessPalette,
} from "@/constants/wellnessTheme"

export function useWellnessColors(): WellnessPalette {
  const scheme = useColorScheme()
  return scheme === "light" ? WellnessColorsLight : WellnessColors
}
