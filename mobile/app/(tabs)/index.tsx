import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  Appearance,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { WellnessColors as W } from "@/constants/wellnessTheme"

const FEATURES = [
  {
    icon: "calendar-outline" as const,
    title: "1 Task/Day",
    description: "Just one small step to focus on",
  },
  {
    icon: "mic-outline" as const,
    title: "Voice Guided",
    description: "Calming audio instructions",
  },
  {
    icon: "sparkles-outline" as const,
    title: "AI Personalized",
    description: "Tasks adapt to your mood",
  },
  {
    icon: "cloud-offline-outline" as const,
    title: "Offline Ready",
    description: "Works without internet",
  },
]

export default function HomeScreen() {
  const router = useRouter()
  const [colorScheme, setColorScheme] = useState<"light" | "dark" | null>(
    () => Appearance.getColorScheme() ?? "dark",
  )

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme: cs }) => {
      setColorScheme(cs ?? "dark")
    })
    return () => sub.remove()
  }, [])

  const toggleTheme = useCallback(() => {
    const next = colorScheme === "dark" ? "light" : "dark"
    Appearance.setColorScheme(next)
  }, [colorScheme])

  const goTask = useCallback(() => {
    router.push("/(tabs)/task")
  }, [router])

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Header — matches web landing */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoMark}>
              <Text style={styles.logoLetter}>W</Text>
            </View>
            <Text style={styles.brandName}>Wellness</Text>
          </View>
          <Pressable
            onPress={toggleTheme}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Toggle light or dark theme"
          >
            <Ionicons
              name={colorScheme === "dark" ? "sunny-outline" : "moon-outline"}
              size={22}
              color={W.text}
            />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.headline}>Bite-Size Wellness Ladder</Text>
          <Text style={styles.subhead}>
            One tiny self-care step daily. Unlock the next only when done. Build habits effortlessly.
          </Text>

          <Pressable
            style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
            onPress={goTask}
          >
            <Text style={styles.ctaText}>Start Your Ladder</Text>
          </Pressable>
        </View>

        {/* Feature grid — 2 columns, stacks on narrow phones naturally via flex */}
        <View style={styles.grid}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name={f.icon} size={26} color={W.primary} />
              </View>
              <Text style={styles.cardTitle}>{f.title}</Text>
              <Text style={styles.cardDesc}>{f.description}</Text>
            </View>
          ))}
        </View>

        {/* Mini preview — echoes web “Day 3” card */}
        <View style={styles.preview}>
          <View style={styles.previewTopRow}>
            <View style={styles.previewLeft}>
              <View style={styles.dayPill}>
                <Text style={styles.dayPillText}>Day 3</Text>
              </View>
              <Text style={styles.previewTitle}>Your Progress</Text>
            </View>
            <View style={styles.spinnerRing} />
          </View>
          <View style={styles.previewTaskBox}>
            <Text style={styles.previewHint}>{"Today's Task"}</Text>
            <Text style={styles.previewTask}>Take 3 deep breaths</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: W.bg,
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoMark: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: W.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: W.primary,
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  logoLetter: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },
  brandName: {
    color: W.text,
    fontSize: 17,
    fontWeight: "600",
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 16,
    alignItems: "center",
  },
  headline: {
    color: W.text,
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 36,
    marginBottom: 12,
  },
  subhead: {
    color: W.textMuted,
    fontSize: 17,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 28,
    maxWidth: 400,
  },
  cta: {
    backgroundColor: W.primary,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 18,
    minWidth: 280,
    maxWidth: "100%",
    alignItems: "center",
    shadowColor: W.primary,
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  ctaPressed: {
    backgroundColor: W.primaryPressed,
    opacity: 0.95,
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginTop: 36,
    gap: 12,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: W.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: W.cardBorder,
    padding: 16,
    alignItems: "center",
    marginBottom: 4,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: W.iconBg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  cardTitle: {
    color: W.text,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  cardDesc: {
    color: W.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 16,
  },
  preview: {
    marginHorizontal: 24,
    marginTop: 28,
    backgroundColor: W.bgElevated,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: W.cardBorder,
  },
  previewTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  previewLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  dayPill: {
    backgroundColor: W.iconBg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  dayPillText: {
    color: W.primary,
    fontSize: 13,
    fontWeight: "600",
  },
  previewTitle: {
    color: W.text,
    fontSize: 15,
    fontWeight: "600",
  },
  spinnerRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: W.primary,
    borderTopColor: "transparent",
  },
  previewTaskBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  previewHint: {
    color: W.textMuted,
    fontSize: 13,
    marginBottom: 6,
  },
  previewTask: {
    color: W.text,
    fontSize: 16,
    fontWeight: "600",
  },
})
