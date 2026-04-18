import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import LottieView from "lottie-react-native"
import { useEffect, useMemo } from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { TaskNotoIcon } from "@/components/TaskNotoIcon"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessCelebration } from "@/lib/wellnessFeedback"
import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"
import type { StreakData } from "@/lib/wellness-data"
import { getTodayTask } from "@/lib/wellness-data"
import { isWellnessPro } from "@/lib/wellness-pro"

const confetti = require("@/assets/lottie/confetti.json")
const STREAK_FLAME_NOTO = "1f525"

function createCelebrationStyles(W: WellnessPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: W.bg },
    lottieWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 320,
      alignItems: "center",
      pointerEvents: "none",
    },
    completionScroll: {
      padding: 24,
      alignItems: "center",
      paddingTop: 16,
    },
    backBtn: { alignSelf: "flex-start", marginBottom: 16 },
    completionIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: W.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      shadowColor: W.primary,
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    completionTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: W.text,
      marginBottom: 8,
    },
    completionSub: {
      fontSize: 16,
      color: W.textMuted,
      textAlign: "center",
      marginBottom: 20,
    },
    streakRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 20,
    },
    flame: { width: 44, height: 44 },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: W.iconBg,
    },
    streakText: { fontWeight: "700", fontSize: 17, color: W.text },
    previewCard: {
      width: "100%",
      maxWidth: 400,
      padding: 18,
      borderRadius: 16,
      backgroundColor: W.bgElevated,
      borderWidth: 1,
      borderColor: W.cardBorder,
      marginBottom: 16,
    },
    previewLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: W.textMuted,
      marginBottom: 12,
    },
    previewRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
    previewTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: W.text,
      flex: 1,
    },
    previewBody: { fontSize: 13, color: W.textMuted, marginTop: 6, lineHeight: 18 },
    previewMeta: { fontSize: 12, color: W.primary, marginTop: 8 },
    proCard: {
      width: "100%",
      maxWidth: 400,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: W.primary,
      backgroundColor: W.iconBg,
      marginBottom: 20,
    },
    proLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: W.primary,
      marginBottom: 6,
    },
    proBody: { fontSize: 14, color: W.text, lineHeight: 20 },
    completionHint: {
      fontSize: 14,
      color: W.textMuted,
      textAlign: "center",
      marginBottom: 20,
    },
    completionActions: { flexDirection: "row", gap: 12 },
    outlineBtn: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    outlineBtnText: { color: W.text, fontWeight: "600" },
    primaryBtn: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: W.primary,
    },
    primaryBtnText: { color: "#fff", fontWeight: "700" },
  })
}

type Props = {
  streakData: StreakData
}

export function TaskCompletionCelebration({ streakData }: Props) {
  const router = useRouter()
  const W = useWellnessColors()
  const styles = useMemo(() => createCelebrationStyles(W), [W])
  const pro = isWellnessPro()

  const nextTask = useMemo(
    () => getTodayTask(streakData.currentStreak + 1),
    [streakData.currentStreak],
  )

  const flameUri = emojiFamilySvgUrl(STREAK_FLAME_NOTO, "noto")

  useEffect(() => {
    wellnessCelebration()
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.lottieWrap}>
        <LottieView
          source={confetti}
          autoPlay
          loop={false}
          style={{ width: 360, height: 300 }}
        />
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: "transparent" }}
        contentContainerStyle={styles.completionScroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={26} color={W.text} />
        </Pressable>

        <View style={styles.completionIconWrap}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.completionTitle}>Well done!</Text>
        <Text style={styles.completionSub}>
          {"You've completed today's wellness task. See you tomorrow for the next step."}
        </Text>

        <View style={styles.streakRow}>
          <Image
            source={{ uri: flameUri }}
            style={styles.flame}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>
              {streakData.currentStreak} day streak
            </Text>
          </View>
        </View>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Next on your ladder</Text>
          <View style={styles.previewRow}>
            <TaskNotoIcon iconCode={nextTask.iconCode} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle}>{nextTask.title}</Text>
              <Text style={styles.previewBody} numberOfLines={4}>
                {nextTask.instruction}
              </Text>
              <Text style={styles.previewMeta}>
                ~{nextTask.duration}s · tomorrow
              </Text>
            </View>
          </View>
        </View>

        {pro ? (
          <View style={styles.proCard}>
            <Text style={styles.proLabel}>Pro bonus</Text>
            <Text style={styles.proBody}>
              Extra calm: open Goals anytime for a second micro-win — your streak
              still counts one task per day.
            </Text>
          </View>
        ) : null}

        <Text style={styles.completionHint}>
          Come back tomorrow for your next step up the ladder!
        </Text>
        <View style={styles.completionActions}>
          <Pressable
            style={styles.outlineBtn}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.outlineBtnText}>Home</Text>
          </Pressable>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={styles.primaryBtnText}>View Progress</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
