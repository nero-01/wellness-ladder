import { useCallback, useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"
import { BrandedScreenBackdrop } from "@/components/BrandedScreenBackdrop"
import { useAuth } from "@/contexts/AuthContext"
import { useBrandedBackdrop } from "@/contexts/BrandedBackdropContext"
import { markOnboardingComplete } from "@/lib/onboarding-storage"
import { skipOrFinishOnboarding } from "@/lib/onboarding-nav"

const BULLETS = ["Tiny habits, real change", "Designed for busy, full-on lives"]

export default function OnboardingValueScreen() {
  const router = useRouter()
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
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
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
                pressed && { opacity: 0.9 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Next"
            >
              <Text style={styles.nextText}>Next</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </BrandedScreenBackdrop>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
    paddingTop: 4,
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
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 22,
    backgroundColor: "rgba(21, 17, 24, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 18,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  bulletDot: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    color: "rgba(255,255,255,0.92)",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  next: {
    marginTop: 22,
    alignSelf: "stretch",
    backgroundColor: "#8b5cf6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  nextText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
})
