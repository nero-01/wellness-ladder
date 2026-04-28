import { useEffect, useState, useCallback } from "react"
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
import { isSupabaseConfigured } from "@/lib/supabase"
import { markOnboardingComplete } from "@/lib/onboarding-storage"
import { skipOrFinishOnboarding } from "@/lib/onboarding-nav"
import type { OAuthProviderId } from "@/contexts/AuthContext"

export default function OnboardingAuthLiteScreen() {
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
          "Add Supabase URL and anon key in mobile/.env to use Apple or Google. You can still explore as a guest below.",
        )
        return
      }
      setOauthBusy(provider)
      try {
        await signInWithOAuth(provider)
        router.replace("/(tabs)")
      } catch (e) {
        Alert.alert(
          "Sign-in",
          e instanceof Error ? e.message : "Could not complete sign-in.",
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
        <StatusBar style="light" />
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
      <StatusBar style="light" />
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
                Pick a quick option, use email, or explore without an account. You can add a
                profile later.
              </Text>
            {Platform.OS === "ios" ? (
              <Pressable
                style={[styles.oauth, oauthBusy != null && styles.oauthDisabled]}
                onPress={() => void onOAuth("apple")}
                disabled={oauthBusy != null || busy}
              >
                {oauthBusy === "apple" ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="logo-apple" size={22} color="#fff" />
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
                <ActivityIndicator color="#111" />
              ) : (
                <>
                  <Ionicons name="logo-google" size={22} color="#111" />
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

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    paddingTop: 6,
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  skipText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 15,
    fontWeight: "600",
  },
  cardWrap: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 26,
    paddingHorizontal: 20,
    backgroundColor: "rgba(21, 17, 24, 0.78)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  body: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  oauth: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#000",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  oauthGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  oauthDisabled: { opacity: 0.65 },
  oauthText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  oauthTextDark: { color: "#111", fontSize: 16, fontWeight: "700" },
  secondary: {
    marginTop: 4,
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  secondaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  ghost: {
    marginTop: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  ghostText: {
    color: "rgba(255,255,255,0.95)",
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  primary: {
    marginTop: 16,
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontSize: 16, fontWeight: "700" },
})
