import "react-native-url-polyfill/auto"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import {
  DarkTheme as NavigationDarkTheme,
  DefaultTheme as NavigationDefaultTheme,
  ThemeProvider,
} from "@react-navigation/native"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { useFonts } from "expo-font"
import { Stack, usePathname, useRouter } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import { StatusBar } from "expo-status-bar"
import { useEffect } from "react"
import "react-native-reanimated"

import { useColorScheme } from "@/components/useColorScheme"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { WellnessColors } from "@/constants/wellnessTheme"

const WellnessDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: WellnessColors.primary,
    background: WellnessColors.bg,
    card: WellnessColors.bgElevated,
    text: WellnessColors.text,
    border: WellnessColors.cardBorder,
    notification: WellnessColors.primary,
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
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    const path = pathname ?? ""
    const inAuthScreen = path.includes("sign-in") || path.includes("sign-up")
    const isRootEntry =
      path === "/" || path === "" || path === "/index" || path.endsWith("/index")

    if (isRootEntry) return

    if (!user && !inAuthScreen) {
      router.replace("/(auth)/sign-in")
    } else if (user && inAuthScreen) {
      router.replace("/(tabs)")
    }
  }, [user, isLoaded, pathname, router])
}

function RootLayoutNav() {
  const colorScheme = useColorScheme()
  useProtectedRoute()

  const navTheme =
    colorScheme === "dark" ? WellnessDarkTheme : NavigationDefaultTheme

  return (
    <ThemeProvider value={navTheme}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  )
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  })

  useEffect(() => {
    if (error) throw error
  }, [error])

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync()
  }, [loaded])

  if (!loaded) return null

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  )
}
