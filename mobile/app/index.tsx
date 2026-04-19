import { Redirect } from "expo-router"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { Mascot } from "@/components/Mascot"
import { useAuth } from "@/contexts/AuthContext"
import { useColorScheme } from "@/components/useColorScheme"
import { WellnessColors, WellnessColorsLight } from "@/constants/wellnessTheme"

/**
 * Entry: wait for auth bootstrap, then send users to sign-in or main tabs.
 * Avoids sending everyone to `/(tabs)` first (which fought `useProtectedRoute` and caused flashes / loops).
 */
export default function Index() {
  const { user, isLoaded } = useAuth()
  const colorScheme = useColorScheme()
  const bg = colorScheme === "light" ? WellnessColorsLight.bg : WellnessColors.bg

  if (!isLoaded) {
    return (
      <View style={[styles.centered, { backgroundColor: bg }]}>
        <Mascot state="idle" preset="loading" motionProfile="calm" animated />
        <View style={{ height: 20 }} />
        <ActivityIndicator size="large" color={WellnessColors.primary} accessibilityLabel="Loading session" />
      </View>
    )
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />
  }

  return <Redirect href="/(tabs)" />
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
