import { useEffect, useState } from "react"
import { Redirect } from "expo-router"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useAuth } from "@/contexts/AuthContext"
import { useColorScheme } from "@/components/useColorScheme"
import { WellnessColors, WellnessColorsLight } from "@/constants/wellnessTheme"
import { getOnboardingComplete } from "@/lib/onboarding-storage"

/**
 * Entry: wait for auth bootstrap, then onboarding (first launch), sign-in, or main tabs.
 * Avoids sending everyone to `/(tabs)` first (which fought `useProtectedRoute` and caused flashes / loops).
 */
export default function Index() {
  const { user, isLoaded } = useAuth()
  const colorScheme = useColorScheme()
  const bg = colorScheme === "light" ? WellnessColorsLight.bg : WellnessColors.bg
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null)
  const hardcodeSplash = process.env.EXPO_PUBLIC_HARDCODE_SPLASH === "true"
  const forceOnboarding = process.env.EXPO_PUBLIC_FORCE_ONBOARDING === "true"

  /** After auth hydrates (and may write onboarding for returning sessions), read the flag. */
  useEffect(() => {
    if (!isLoaded) return
    setOnboardingDone(null)
    void getOnboardingComplete().then(setOnboardingDone)
  }, [isLoaded])

  useEffect(() => {
    if (!__DEV__) return
    // eslint-disable-next-line no-console
    console.log("[route/index] state", {
      isLoaded,
      onboardingDone,
      hardcodeSplash,
      forceOnboarding,
      hasUser: !!user,
      isGuest: user?.isGuest ?? null,
    })
  }, [forceOnboarding, hardcodeSplash, isLoaded, onboardingDone, user])

  useEffect(() => {
    if (!__DEV__) return
    // eslint-disable-next-line no-console
    console.log("[route/index] forceOnboarding:", forceOnboarding)
    // eslint-disable-next-line no-console
    console.log("[route/index] onboardingDone:", onboardingDone)
  }, [forceOnboarding, onboardingDone])

  if (!isLoaded) {
    return (
      <View style={[styles.centered, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={WellnessColors.primary} accessibilityLabel="Loading session" />
      </View>
    )
  }

  if (onboardingDone === null) {
    return (
      <View style={[styles.centered, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={WellnessColors.primary} accessibilityLabel="Loading" />
      </View>
    )
  }

  if (hardcodeSplash) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[route/index] redirect -> /(onboarding)/splash (hardcoded)")
    }
    return <Redirect href="/(onboarding)/splash" />
  }

  if (forceOnboarding) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[route/index] redirect -> /(onboarding)/splash (forced)")
    }
    return <Redirect href="/(onboarding)/splash" />
  }

  /** Onboarding first: must run before the signed-in / guest tab redirect. */
  if (!onboardingDone) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[route/index] redirect -> /(onboarding)/splash")
    }
    return <Redirect href="/(onboarding)/splash" />
  }

  if (user) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[route/index] redirect -> /(tabs)")
    }
    return <Redirect href="/(tabs)" />
  }

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log("[route/index] redirect -> /(auth)/sign-in")
  }
  return <Redirect href="/(auth)/sign-in" />
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
