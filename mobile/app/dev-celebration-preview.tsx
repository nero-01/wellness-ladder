import { Pressable, StyleSheet, Text, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TaskCompletionCelebration } from "@/components/TaskCompletionCelebration"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { DEFAULT_STREAK_DATA, type StreakData } from "@/lib/wellness-data"
import { useWellnessLocale } from "@/lib/wellness-locale"

/** Same shape as after completing today — tune numbers for layout preview only. */
const MOCK_STREAK: StreakData = {
  ...DEFAULT_STREAK_DATA,
  currentStreak: 4,
  maxStreak: 7,
  moodStreak: 4,
  maxMoodStreak: 7,
  lastCompletedDate: new Date().toISOString().slice(0, 10),
  totalCompleted: 12,
  moodHistory: [
    { date: new Date().toISOString().slice(0, 10), mood: 4 },
    { date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), mood: 5 },
  ],
  completionHistory: [{ date: new Date().toISOString().slice(0, 10), taskId: 4 }],
}

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    toolbar: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: W.cardBorder,
      backgroundColor: W.bg,
    },
    toolbarTitle: {
      fontSize: 12,
      fontWeight: "700",
      color: W.textMuted,
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    row: { flexDirection: "row", gap: 10 },
    chip: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.bgElevated,
    },
    chipOn: {
      borderColor: W.primary,
      backgroundColor: W.iconBg,
    },
    chipText: { fontSize: 14, fontWeight: "600", color: W.text },
    hint: {
      marginTop: 8,
      fontSize: 12,
      color: W.textMuted,
      lineHeight: 17,
    },
  })
}

/**
 * Dev-only: preview the post-done screen with SADAG tip, helplines, WhatsApp, next task.
 * Does not require completing a real task or signing in (__DEV__ gate in root layout).
 */
export default function DevCelebrationPreviewScreen() {
  const W = useWellnessColors()
  const styles = createStyles(W)
  const insets = useSafeAreaInsets()
  const { locale, setLocale, ready } = useWellnessLocale()

  return (
    <View style={{ flex: 1, backgroundColor: W.bg }}>
      <View style={[styles.toolbar, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.toolbarTitle}>Preview locale (stored like production)</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.chip, ready && locale === "en" && styles.chipOn]}
            onPress={() => setLocale("en")}
          >
            <Text style={styles.chipText}>English</Text>
          </Pressable>
          <Pressable
            style={[styles.chip, ready && locale === "af" && styles.chipOn]}
            onPress={() => setLocale("af")}
          >
            <Text style={styles.chipText}>Afrikaans</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>
          SADAG block and tips appear here after a real task too: Task tab → complete
          today → this same screen. Random tip changes each time you open this preview.
        </Text>
      </View>
      <View style={{ flex: 1, minHeight: 0 }}>
        <TaskCompletionCelebration streakData={MOCK_STREAK} />
      </View>
    </View>
  )
}
