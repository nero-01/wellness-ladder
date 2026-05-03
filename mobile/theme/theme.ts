import {
  WellnessColors,
  WellnessColorsLight,
  type WellnessPalette,
} from "@/constants/wellnessTheme"

export type AppThemeName = "light" | "dark"

export type AppTheme = {
  name: AppThemeName
  isDark: boolean
  colors: WellnessPalette
  backgroundLight: string
  backgroundDark: string
  backdropOverlay: string
}

export const appThemes: Record<AppThemeName, AppTheme> = {
  light: {
    name: "light",
    isDark: false,
    colors: WellnessColorsLight,
    backgroundLight: WellnessColorsLight.bg,
    backgroundDark: WellnessColors.bg,
    /** Soft lavender wash so branded backdrop stays on-palette in light mode */
    backdropOverlay: "rgba(91, 109, 219, 0.07)",
  },
  dark: {
    name: "dark",
    isDark: true,
    colors: WellnessColors,
    backgroundLight: WellnessColorsLight.bg,
    backgroundDark: WellnessColors.bg,
    /** Deepen slightly without muddying the hero gradient */
    backdropOverlay: "rgba(8, 10, 20, 0.42)",
  },
}
