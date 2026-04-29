import { createContext, useContext, useMemo, type PropsWithChildren } from "react"
import { DarkModeProvider, useDarkMode } from "react-native-dark"
import { appThemes, type AppTheme } from "@/theme/theme"

const ThemeContext = createContext<AppTheme>(appThemes.dark)

function ThemeContextInner({ children }: PropsWithChildren) {
  const isDark = useDarkMode()
  const theme = useMemo(() => (isDark ? appThemes.dark : appThemes.light), [isDark])
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}

export function AppThemeProvider({ children }: PropsWithChildren) {
  return (
    <DarkModeProvider colorMode="auto">
      <ThemeContextInner>{children}</ThemeContextInner>
    </DarkModeProvider>
  )
}

export function useAppTheme() {
  return useContext(ThemeContext)
}
