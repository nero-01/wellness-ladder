import { Stack } from "expo-router"
import { Platform } from "react-native"
import { useColorScheme } from "@/components/useColorScheme"
import { WellnessColors, WellnessColorsLight } from "@/constants/wellnessTheme"

export default function AuthLayout() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const bg = isDark ? WellnessColors.bg : WellnessColorsLight.bg
  const tint = isDark ? WellnessColors.text : WellnessColorsLight.text

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
