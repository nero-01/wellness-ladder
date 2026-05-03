import { useCallback, useMemo, useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { BrandedScreenBackdrop } from "@/components/BrandedScreenBackdrop"
import { useAuth } from "@/contexts/AuthContext"
import { useBrandedBackdrop } from "@/contexts/BrandedBackdropContext"
import { markOnboardingComplete } from "@/lib/onboarding-storage"
import { skipOrFinishOnboarding } from "@/lib/onboarding-nav"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useAppTheme } from "@/contexts/ThemeContext"
import { wellnessCardShadow } from "@/constants/wellnessSurface"
import {
  gapSection,
  inset,
  padSection,
  radiusLg,
  radiusMd,
  spaceSm,
} from "@/constants/layoutTokens"

const BULLETS = ["Tiny habits, real change", "Designed for busy, full-on lives"]
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
      marginBottom: padSection,
    },
    bulletRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: gapSection,
      gap: spaceSm,
    },
    bulletDot: {
      color: W.textMuted,
      fontSize: 16,
      lineHeight: 22,
    },
    bulletText: {
      flex: 1,
      color: W.text,
      fontSize: 16,
      lineHeight: 24,
      fontWeight: "600",
    },
    next: {
      marginTop: padSection + spaceSm,
      alignSelf: "stretch",
      backgroundColor: W.primary,
      paddingVertical: 14,
      borderRadius: radiusMd,
      alignItems: "center",
    },
    nextPressed: {
      backgroundColor: W.primaryPressed,
    },
    nextText: {
      color: "#F5F7FF",
      fontSize: 16,
      fontWeight: "700",
    },
  })
}

export default function OnboardingValueScreen() {
  const { isDark } = useAppTheme()
  const W = useWellnessColors()
  const styles = useMemo(() => createStyles(W), [W])
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { tour } = useLocalSearchParams<{ tour?: string }>()
  const tourOnly = tour === "1"
  const { user, continueAsGuest } = useAuth()
  const { setBrandedImageUri } = useBrandedBackdrop()
  const [busy, setBusy] = useState(false)

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

  const onNext = useCallback(async () => {
    setBusy(true)
    try {
      await markOnboardingComplete()
      router.push({
        pathname: "/(onboarding)/auth-lite",
        params: tourOnly ? { tour: "1" } : {},
      })
    } finally {
      setBusy(false)
    }
  }, [router, tourOnly])

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
              disabled={busy}
              accessibilityRole="button"
              accessibilityLabel="Skip onboarding"
              style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.75 }]}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Why this app</Text>
              {BULLETS.map((line) => (
                <View key={line} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>{"\u2022"}</Text>
                  <Text style={styles.bulletText}>{line}</Text>
                </View>
              ))}
              <Pressable
                onPress={() => void onNext()}
                disabled={busy}
                style={({ pressed }) => [
                  styles.next,
                  pressed && styles.nextPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Next"
              >
                <Text style={styles.nextText}>Next</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </BrandedScreenBackdrop>
  )
}
