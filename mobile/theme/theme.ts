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
}

export const appThemes: Record<AppThemeName, AppTheme> = {
  light: {
    name: "light",
    isDark: false,
    colors: WellnessColorsLight,
  },
  dark: {
    name: "dark",
    isDark: true,
    colors: WellnessColors,
  },
}
