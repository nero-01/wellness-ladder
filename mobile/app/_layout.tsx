import "react-native-url-polyfill/auto"
import * as WebBrowser from "expo-web-browser"
import FontAwesome from "@expo/vector-icons/FontAwesome"

WebBrowser.maybeCompleteAuthSession()
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { ActivityIndicator, Platform, View } from "react-native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useFonts } from "expo-font"
import { Stack, usePathname, useRouter, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import "react-native-reanimated"

import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { BrandedBackdropProvider } from "@/contexts/BrandedBackdropContext"
import { RecurringHabitsProvider } from "@/contexts/RecurringHabitsContext"
import { AppThemeProvider, useAppTheme } from "@/contexts/ThemeContext"
import { initRecurringNotificationHandler } from "@/lib/recurring-habit-notifications"
import { appThemes } from "@/theme/theme"

const WellnessDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: appThemes.dark.colors.primary,
    background: appThemes.dark.colors.bg,
    card: appThemes.dark.colors.bgElevated,
    text: appThemes.dark.colors.text,
    border: appThemes.dark.colors.cardBorder,
    notification: appThemes.dark.colors.primary,
  },
}

const WellnessLightNavTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: appThemes.light.colors.primary,
    background: appThemes.light.colors.bg,
    card: appThemes.light.colors.bgElevated,
    text: appThemes.light.colors.text,
    border: appThemes.light.colors.cardBorder,
    notification: appThemes.light.colors.primary,
  },
}

export { ErrorBoundary } from "expo-router"

SplashScreen.preventAutoHideAsync()

/**
 * Keeps unauthenticated users off tab routes (e.g. deep links) and moves
 * authenticated users out of auth screens. Root `index` handles `/` entry.
 */
function useProtectedRoute() {
  const { user, isLoaded } = useAuth()
  const pathname = usePathname()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    const path = pathname ?? ""
    const firstSegment = String(segments[0] ?? "")
    const inAuthGroup = firstSegment === "(auth)"
    const inOnboardingGroup = firstSegment === "(onboarding)"
    const inAuthScreen = inAuthGroup || path.includes("sign-in") || path.includes("sign-up")
    const inOnboarding = inOnboardingGroup || path === "/splash" || path === "/value" || path === "/auth-lite"
    const isRootEntry =
      path === "/" || path === "" || path === "/index" || path.endsWith("/index")

    if (isRootEntry) return

    const isDevTaskLab =
      __DEV__ &&
      (path.includes("dev-task-preview") ||
        path.includes("dev-task-session") ||
        path.includes("dev-celebration-preview"))

    if (!user && !inAuthScreen && !inOnboarding && !isDevTaskLab) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log("[route/protected] redirect -> /(auth)/sign-in", { path })
      }
      router.replace("/(auth)/sign-in")
    } else if (user && inAuthScreen) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log("[route/protected] redirect -> /(tabs)", { path })
      }
      router.replace("/(tabs)")
    }
  }, [user, isLoaded, pathname, router, segments])
}

function RootLayoutNav() {
  const { colors, isDark } = useAppTheme()
  useProtectedRoute()

  useEffect(() => {
    initRecurringNotificationHandler()
  }, [])

  const navTheme = isDark ? WellnessDarkTheme : WellnessLightNavTheme
  const rootBg = colors.bg

  const headerBg = rootBg
  const headerTint = colors.text

  return (
    <ThemeProvider value={navTheme}>
      <View style={{ flex: 1, backgroundColor: rootBg }}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <Stack
          screenOptions={{
            contentStyle: { flex: 1, backgroundColor: rootBg },
            /**
             * Fade beats default slide for speed; `animationDuration` shortens iOS transitions
             * (see native-stack docs). Android still uses fade; duration may be system-tuned.
             */
            animation: "fade",
            animationDuration: Platform.OS === "ios" ? 175 : 220,
            gestureEnabled: true,
            ...(Platform.OS === "ios" ? { fullScreenGestureEnabled: true } : {}),
          }}
        >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="dev-task-preview"
          options={{
            title: "Dev · All tasks",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: headerBg },
            headerTintColor: headerTint,
          }}
        />
        <Stack.Screen name="dev-task-session" options={{ headerShown: false }} />
        <Stack.Screen
          name="dev-celebration-preview"
          options={{
            title: "Dev · SADAG completion",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: headerBg },
            headerTintColor: headerTint,
          }}
        />
        <Stack.Screen
          name="recurring-habits"
          options={{
            title: "Recurring habits",
            headerBackTitle: "Back",
            headerStyle: { backgroundColor: headerBg },
            headerTintColor: headerTint,
          }}
        />
        </Stack>
      </View>
    </ThemeProvider>
  )
}

function RootLayoutContent() {
  const { colors } = useAppTheme()
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  /**
   * Expo native splash = static image in app.config.js only.
   * Pattern: keep native splash until fonts are ready → hide once → JS routes (e.g. /(onboarding)/splash) can mount the full-screen GIF.
   * Do not call `hideAsync` from onboarding screens (single call here after `loaded`).
   */
  useEffect(() => {
    if (!loaded) return
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[route/_layout] SplashScreen.hideAsync() called")
    }
    void SplashScreen.hideAsync()
  }, [loaded])

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bg,
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
        accessibilityLabel="Loading app"
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaProvider>
      <BrandedBackdropProvider>
        <AuthProvider>
          <RecurringHabitsProvider>
            <RootLayoutNav />
          </RecurringHabitsProvider>
        </AuthProvider>
      </BrandedBackdropProvider>
    </SafeAreaProvider>
  )
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootLayoutContent />
    </AppThemeProvider>
  )
}
