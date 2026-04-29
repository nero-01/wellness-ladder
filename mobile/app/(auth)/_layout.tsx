import { Stack } from "expo-router"
import { Platform } from "react-native"
import { useAppTheme } from "@/contexts/ThemeContext"

export default function AuthLayout() {
  const { colors } = useAppTheme()
  const bg = colors.bg
  const tint = colors.text

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: bg },
        headerTintColor: tint,
        headerShadowVisible: false,
        contentStyle: { flex: 1, backgroundColor: bg },
        animation: "fade",
        animationDuration: Platform.OS === "ios" ? 130 : 165,
      }}
    />
  )
}
