import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useState } from "react"
import type { ComponentProps } from "react"
import {
  Appearance,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Mascot } from "@/components/Mascot"
import { TaskCatalogPreview } from "@/components/TaskCatalogPreview"
import { TaskStepIconWell } from "@/components/TaskStepCard"
import { previewCardShadow } from "@/constants/homeCard"
import {
  gapItem,
  gapSection,
  inset,
  padCard,
  padSection,
  radiusInner,
  radiusLg,
  radiusMd,
} from "@/constants/layoutTokens"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useStreak } from "@/hooks/useStreak"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessTapLight, wellnessTapMedium } from "@/lib/wellnessFeedback"
import { getTodayTask } from "@/lib/wellness-data"
import {
  FEATURE_TILE_PASTEL_KEYS,
  moodPastelAccent,
} from "@/lib/mood-pastels"
import type { MoodPastelKey } from "@/lib/mood-pastels"

const FEATURES: {
  icon: ComponentProps<typeof Ionicons>["name"]
  title: string
  description: string
  pastelKey: MoodPastelKey
}[] = [
  {
    icon: "calendar-outline",
    title: "1 Task/Day",
    description: "Just one small step to focus on",
    pastelKey: FEATURE_TILE_PASTEL_KEYS[0],
  },
  {
    icon: "mic-outline",
    title: "Voice Guided",
    description: "Calming audio instructions",
    pastelKey: FEATURE_TILE_PASTEL_KEYS[1],
  },
  {
    icon: "sparkles-outline",
    title: "AI Personalized",
    description: "Tasks adapt to your mood",
    pastelKey: FEATURE_TILE_PASTEL_KEYS[2],
  },
  {
    icon: "cloud-offline-outline",
    title: "Offline Ready",
    description: "Works without internet",
    pastelKey: FEATURE_TILE_PASTEL_KEYS[3],
  },
]

function createHomeStyles(W: WellnessPalette) {
  return StyleSheet.create({
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
      paddingHorizontal: inset,
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
      paddingHorizontal: inset,
      paddingTop: 4,
      alignItems: "center",
    },
    heroMascot: {
      alignItems: "center",
      marginBottom: 0,
    },
    headline: {
      color: W.text,
      fontSize: 30,
      fontWeight: "800",
      textAlign: "center",
      lineHeight: 36,
      marginTop: -2,
      marginBottom: 10,
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
      borderRadius: radiusMd,
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
    ladderSection: {
      paddingHorizontal: inset,
      marginTop: gapSection / 2,
    },
    devLinkWrap: {
      paddingHorizontal: inset,
      marginTop: gapSection,
    },
    devLink: {
      alignSelf: "flex-start",
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: W.primary,
      backgroundColor: W.iconBg,
    },
    devLinkText: {
      fontSize: 13,
      fontWeight: "700",
      color: W.primary,
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      paddingHorizontal: inset,
      marginTop: 32,
      gap: gapItem,
      justifyContent: "space-between",
      alignItems: "stretch",
    },
    card: {
      width: "48%",
      minHeight: 172,
      borderRadius: radiusMd,
      borderWidth: 1,
      padding: padCard,
      alignItems: "center",
      justifyContent: "flex-start",
      marginBottom: 0,
      ...previewCardShadow,
    },
    iconCircle: {
      width: 52,
      height: 52,
      borderRadius: radiusMd,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
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
      marginHorizontal: inset,
      marginTop: 24,
      borderRadius: radiusLg,
      borderWidth: 1,
      borderColor: W.cardBorder,
      overflow: "hidden",
      flexDirection: "row",
      alignItems: "stretch",
      ...previewCardShadow,
    },
    previewAccentBar: {
      width: 4,
      alignSelf: "stretch",
    },
    previewBody: {
      flex: 1,
      padding: padSection,
    },
    previewTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: gapSection,
    },
    previewLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
    },
    dayPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
    },
    dayPillText: {
      fontSize: 13,
      fontWeight: "600",
    },
    previewTitle: {
      color: W.text,
      fontSize: 15,
      fontWeight: "600",
    },
    previewGlyphWrap: {
      alignItems: "center",
      justifyContent: "center",
    },
    previewTaskBox: {
      backgroundColor: W.surfaceMuted,
      borderRadius: radiusInner,
      borderWidth: 1,
      borderColor: W.cardBorder,
      padding: padCard,
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
      textAlign: "center",
    },
    previewMeta: {
      color: W.textMuted,
      fontSize: 12,
      marginTop: 10,
      textAlign: "center",
      lineHeight: 16,
    },
  })
}

export default function HomeScreen() {
  const router = useRouter()
  const W = useWellnessColors()
  const styles = useMemo(() => createHomeStyles(W), [W])
  const { displayStreak, isLoaded: streakLoaded } = useStreak()
  const todayTask = useMemo(
    () => getTodayTask(displayStreak),
    [displayStreak],
  )
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
    wellnessTapLight()
    const next = colorScheme === "dark" ? "light" : "dark"
    Appearance.setColorScheme(next)
  }, [colorScheme])

  const goTask = useCallback(() => {
    wellnessTapMedium()
    router.push("/(tabs)/task")
  }, [router])

  const heroWash = useMemo(
    () =>
      [
        moodPastelAccent(W.moodPastels, "lavender").idleFill,
        moodPastelAccent(W.moodPastels, "paleSky").idleFill,
        W.bg,
      ] as const,
    [W],
  )

  const previewAccent = useMemo(
    () => moodPastelAccent(W.moodPastels, "lavender"),
    [W.moodPastels],
  )
  const dayPillAccent = useMemo(
    () => moodPastelAccent(W.moodPastels, "mint"),
    [W.moodPastels],
  )

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={{ flex: 1, backgroundColor: W.bg }}
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

        <LinearGradient
          colors={[...heroWash]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: 12 }}
        >
          {/* Hero — soft pastel wash (Figma-style calm hero) */}
          <View style={styles.hero}>
            <View style={styles.heroMascot}>
              <Mascot state="idle" preset="hero" animated />
            </View>
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
        </LinearGradient>

        {streakLoaded ? (
          <View style={styles.ladderSection}>
            <TaskCatalogPreview todayTaskId={todayTask.id} />
          </View>
        ) : null}

        {__DEV__ ? (
          <View style={styles.devLinkWrap}>
            <Pressable
              onPress={() => router.push("/dev-task-preview")}
              style={({ pressed }) => [
                styles.devLink,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Open development task preview list"
            >
              <Text style={styles.devLinkText}>Dev: tasks + SA language / SADAG →</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/dev-celebration-preview")}
              style={({ pressed }) => [
                styles.devLink,
                { marginTop: 10 },
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Preview completion screen with SADAG tips"
            >
              <Text style={styles.devLinkText}>Dev: SADAG completion screen →</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Feature grid — one pastel per tile */}
        <View style={styles.grid}>
          {FEATURES.map((f) => {
            const a = moodPastelAccent(W.moodPastels, f.pastelKey)
            return (
              <View
                key={f.title}
                style={[
                  styles.card,
                  {
                    backgroundColor: a.idleFill,
                    borderColor: a.idleBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconCircle,
                    {
                      backgroundColor: a.fill,
                      borderWidth: 1,
                      borderColor: a.border,
                    },
                  ]}
                >
                  <Ionicons name={f.icon} size={26} color={a.navIcon} />
                </View>
                <Text style={styles.cardTitle}>{f.title}</Text>
                <Text style={styles.cardDesc}>{f.description}</Text>
              </View>
            )
          })}
        </View>

        {/* Today’s focus — matches streak + scheduled task */}
        {streakLoaded ? (
          <View
            style={[
              styles.preview,
              {
                backgroundColor: W.bgElevated,
              },
            ]}
          >
            <View
              style={[
                styles.previewAccentBar,
                { backgroundColor: previewAccent.border },
              ]}
            />
            <View style={styles.previewBody}>
              <View style={styles.previewTopRow}>
                <View style={styles.previewLeft}>
                  <View
                    style={[
                      styles.dayPill,
                      {
                        backgroundColor: dayPillAccent.idleFill,
                        borderWidth: 1,
                        borderColor: dayPillAccent.idleBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.dayPillText, { color: dayPillAccent.navIcon }]}
                    >
                      Day {displayStreak}
                    </Text>
                  </View>
                  <Text style={styles.previewTitle}>Your Progress</Text>
                </View>
                <View style={styles.previewGlyphWrap}>
                  <TaskStepIconWell
                    taskId={todayTask.id}
                    size={52}
                    accent
                    accessibilityLabel={`Today’s task: ${todayTask.title}`}
                  />
                </View>
              </View>
              <View style={styles.previewTaskBox}>
                <Text style={styles.previewHint}>{"Today's focus"}</Text>
                <Text style={styles.previewTask}>{todayTask.title}</Text>
                <Text style={styles.previewMeta}>
                  ~{todayTask.duration}s · tap Start Your Ladder to begin
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  )
}
