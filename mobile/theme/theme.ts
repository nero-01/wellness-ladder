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
    backdropOverlay: "rgba(0,0,0,0.05)",
  },
  dark: {
    name: "dark",
    isDark: true,
    colors: WellnessColors,
    backgroundLight: WellnessColorsLight.bg,
    backgroundDark: WellnessColors.bg,
    backdropOverlay: "rgba(0,0,0,0.2)",
  },
}
