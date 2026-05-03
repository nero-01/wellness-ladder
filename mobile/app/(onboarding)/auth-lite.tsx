import { useEffect, useState, useCallback, useMemo } from "react"
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLocalSearchParams, useRouter, Link } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { BrandedScreenBackdrop } from "@/components/BrandedScreenBackdrop"
import { useAuth } from "@/contexts/AuthContext"
import { useBrandedBackdrop } from "@/contexts/BrandedBackdropContext"
import { useAppTheme } from "@/contexts/ThemeContext"
import { isSupabaseConfigured } from "@/lib/supabase"
import { markOnboardingComplete } from "@/lib/onboarding-storage"
import { skipOrFinishOnboarding } from "@/lib/onboarding-nav"
import type { OAuthProviderId } from "@/contexts/AuthContext"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { wellnessCardShadow } from "@/constants/wellnessSurface"
import {
  gapItem,
  gapSection,
  inset,
  padSection,
  radiusLg,
  radiusMd,
  spaceSm,
} from "@/constants/layoutTokens"

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    fill: { flex: 1 },
    safe: { flex: 1 },
    scroll: { flex: 1 },
    scrollContent: {
      flexGrow: 1,
    },
    topBar: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingHorizontal: inset,
      paddingTop: spaceSm,
    },
    skipBtn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
    },
    skipText: {
      color: W.textMuted,
      fontSize: 15,
      fontWeight: "600",
    },
    cardWrap: {
      flexGrow: 1,
      justifyContent: "center",
      paddingHorizontal: inset,
      paddingTop: gapSection,
    },
    card: {
      ...wellnessCardShadow,
      borderRadius: radiusLg,
      paddingVertical: padSection + spaceSm,
      paddingHorizontal: padSection,
      backgroundColor: W.card,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    cardTitle: {
      color: W.text,
      fontSize: 22,
      fontWeight: "800",
      letterSpacing: -0.3,
      marginBottom: spaceSm,
    },
    body: {
      color: W.textMuted,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: padSection,
    },
    oauth: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: gapItem,
      backgroundColor: "#000000",
      paddingVertical: 14,
      borderRadius: radiusMd,
      marginBottom: spaceSm,
    },
    oauthGoogle: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: gapItem,
      backgroundColor: "#FFFFFF",
      paddingVertical: 14,
      borderRadius: radiusMd,
      marginBottom: spaceSm,
    },
    oauthDisabled: { opacity: 0.65 },
    oauthText: { color: "#F5F7FF", fontSize: 16, fontWeight: "700" },
    oauthTextDark: { color: "#111827", fontSize: 16, fontWeight: "700" },
    secondary: {
      marginTop: spaceSm,
      paddingVertical: 14,
      alignItems: "center",
      borderRadius: radiusMd,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
    },
    secondaryText: {
      color: W.text,
      fontSize: 15,
      fontWeight: "700",
    },
    ghost: {
      marginTop: gapSection,
      paddingVertical: 12,
      alignItems: "center",
    },
    ghostText: {
      color: W.text,
      fontSize: 15,
      fontWeight: "700",
      textDecorationLine: "underline",
    },
    primary: {
      marginTop: gapSection,
      backgroundColor: W.primary,
      paddingVertical: 14,
      borderRadius: radiusMd,
      alignItems: "center",
    },
    primaryText: { color: "#F5F7FF", fontSize: 16, fontWeight: "700" },
  })
}

export default function OnboardingAuthLiteScreen() {
  const { isDark } = useAppTheme()
  const W = useWellnessColors()
  const styles = useMemo(() => createStyles(W), [W])
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { tour } = useLocalSearchParams<{ tour?: string }>()
  const tourOnly = tour === "1"
  const { user, continueAsGuest, signInWithOAuth } = useAuth()
  const { setBrandedImageUri } = useBrandedBackdrop()
  const [busy, setBusy] = useState(false)
  const [oauthBusy, setOauthBusy] = useState<OAuthProviderId | null>(null)

  useEffect(() => {
    void markOnboardingComplete()
  }, [])

  const onSkip = useCallback(async () => {
    setBusy(true)
    try {
      await skipOrFinishOnboarding(router, {
        user,
        continueAsGuest,
        setBrandedImageUri,
        videoDurationMs: null,
      })
    } finally {
      setBusy(false)
    }
  }, [router, user, continueAsGuest, setBrandedImageUri, tourOnly])

  const onOAuth = useCallback(
    async (provider: OAuthProviderId) => {
      if (!isSupabaseConfigured()) {
        Alert.alert(
          "Sign-in unavailable",
          "Google and Apple sign-in are almost ready. For now, continue with email or explore as a guest.",
        )
        return
      }
      setOauthBusy(provider)
      try {
        await signInWithOAuth(provider)
        router.replace("/(tabs)")
      } catch (e) {
        Alert.alert(
          "Sign-in did not finish",
          e instanceof Error ? e.message : "Please try again in a moment.",
        )
      } finally {
        setOauthBusy(null)
      }
    },
    [router, signInWithOAuth],
  )

  if (tourOnly && user) {
    return (
      <BrandedScreenBackdrop style={styles.fill}>
        <StatusBar style={isDark ? "light" : "dark"} />
        <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 20, 34) },
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces
          >
            <View style={styles.topBar}>
              <Pressable
                onPress={() => router.replace("/(tabs)")}
                hitSlop={16}
                accessibilityRole="button"
                accessibilityLabel="Close tour"
                style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.75 }]}
              >
                <Text style={styles.skipText}>Close</Text>
              </Pressable>
            </View>
            <View style={styles.cardWrap}>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>You are signed in</Text>
                <Text style={styles.body}>
                  Use the tabs below to keep your streak going. Replay the tour anytime from
                  Progress → How to start.
                </Text>
                <Pressable
                  style={styles.primary}
                  onPress={() => router.replace("/(tabs)")}
                  accessibilityRole="button"
                >
                  <Text style={styles.primaryText}>Back to app</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </BrandedScreenBackdrop>
    )
  }

  return (
    <BrandedScreenBackdrop style={styles.fill}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom + 20, 34) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => void onSkip()}
              hitSlop={16}
              disabled={busy || oauthBusy != null}
              accessibilityRole="button"
              accessibilityLabel="Skip sign in"
              style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sign in (optional)</Text>
              <Text style={styles.body}>
                Pick a quick option now, or keep exploring as a guest. You can connect your
                account anytime.
              </Text>
            {Platform.OS === "ios" ? (
              <Pressable
                style={[styles.oauth, oauthBusy != null && styles.oauthDisabled]}
                onPress={() => void onOAuth("apple")}
                disabled={oauthBusy != null || busy}
              >
                {oauthBusy === "apple" ? (
                  <ActivityIndicator color="#F5F7FF" />
                ) : (
                  <>
                    <Ionicons name="logo-apple" size={22} color="#F5F7FF" />
                    <Text style={styles.oauthText}>Sign in with Apple</Text>
                  </>
                )}
              </Pressable>
            ) : null}
            <Pressable
              style={[styles.oauthGoogle, oauthBusy != null && styles.oauthDisabled]}
              onPress={() => void onOAuth("google")}
              disabled={oauthBusy != null || busy}
            >
              {oauthBusy === "google" ? (
                <ActivityIndicator color="#111827" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={22} color="#111827" />
                  <Text style={styles.oauthTextDark}>Sign in with Google</Text>
                </>
              )}
            </Pressable>
            <Link href="/(auth)/sign-in" asChild>
              <Pressable
                style={styles.secondary}
                disabled={busy || oauthBusy != null}
                accessibilityRole="button"
              >
                <Text style={styles.secondaryText}>Continue with email</Text>
              </Pressable>
            </Link>
            <Pressable
              style={styles.ghost}
              onPress={() => void onSkip()}
              disabled={busy || oauthBusy != null}
              accessibilityRole="button"
              accessibilityLabel="Explore without signing in"
            >
              <Text style={styles.ghostText}>Explore without signing in</Text>
            </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </BrandedScreenBackdrop>
  )
}
