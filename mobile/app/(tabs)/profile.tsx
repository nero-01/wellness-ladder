import { Ionicons } from "@expo/vector-icons"
import { useMemo } from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useAuth } from "@/contexts/AuthContext"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { useStreak } from "@/hooks/useStreak"
import { WELLNESS_TASKS } from "@/lib/wellness-data"

function formatShortDate(iso: string): string {
  try {
    const d = new Date(iso + "T12:00:00")
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function taskTitleForId(taskId: number): string {
  return WELLNESS_TASKS.find((t) => t.id === taskId)?.title ?? `Task ${taskId}`
}

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: W.bg },
    scroll: { paddingBottom: 40 },
    headerBlock: { paddingHorizontal: 20, paddingTop: 8, marginBottom: 8 },
    title: { fontSize: 28, fontWeight: "800", color: W.text },
    subtitle: { fontSize: 15, color: W.textMuted, marginTop: 6, lineHeight: 22 },
    card: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: W.bgElevated,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    cardTitle: {
      fontSize: 13,
      fontWeight: "700",
      color: W.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 14,
    },
    statRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    statRowLast: { marginBottom: 0 },
    statLabel: { fontSize: 16, color: W.text, flex: 1 },
    statValue: { fontSize: 20, fontWeight: "800", color: W.primary },
    statHint: { fontSize: 13, color: W.textMuted, marginTop: 4 },
    divider: {
      height: 1,
      backgroundColor: W.cardBorder,
      marginVertical: 16,
    },
    emptyText: {
      fontSize: 15,
      color: W.textMuted,
      lineHeight: 22,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: W.cardBorder,
    },
    listItemLast: { borderBottomWidth: 0 },
    listMain: { flex: 1, paddingRight: 12 },
    listTitle: { fontSize: 15, fontWeight: "600", color: W.text },
    listMeta: { fontSize: 13, color: W.textMuted, marginTop: 4 },
    moodEmoji: { fontSize: 22 },
    accountBlock: { marginTop: 8 },
    accountName: { fontSize: 18, fontWeight: "600", color: W.text },
    accountEmail: { fontSize: 14, color: W.textMuted, marginTop: 4 },
    signOut: {
      marginTop: 20,
      borderWidth: 1,
      borderColor: W.cardBorder,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: "center",
      backgroundColor: W.surfaceMuted,
    },
    signOutText: { fontSize: 16, fontWeight: "600", color: W.text },
  })
}

export default function ProfileScreen() {
  const W = useWellnessColors()
  const styles = useMemo(() => createStyles(W), [W])
  const { user, signOut } = useAuth()
  const { streakData, isLoaded } = useStreak()

  const moods = streakData.moodHistory.slice(-10).reverse()
  const completions = streakData.completionHistory.slice(-10).reverse()

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>
            Your streak, completed tasks, and mood check-ins stay on this device.
          </Text>
        </View>

        {!isLoaded ? (
          <View style={[styles.card, { marginTop: 20 }]}>
            <Text style={styles.emptyText}>Loading…</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Streak & totals</Text>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Current streak</Text>
                <Text style={styles.statValue}>
                  {streakData.currentStreak} days 🔥
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Tasks completed (all time)</Text>
                <Text style={styles.statValue}>{streakData.totalCompleted}</Text>
              </View>
              <View style={[styles.statRow, styles.statRowLast]}>
                <Text style={styles.statLabel}>Last completed</Text>
                <Text style={[styles.statValue, { fontSize: 16 }]}>
                  {streakData.lastCompletedDate ?
                    formatShortDate(streakData.lastCompletedDate)
                  : "—"}
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent moods</Text>
              {moods.length === 0 ?
                <Text style={styles.emptyText}>
                  Mood picks from your daily task will show up here.
                </Text>
              : moods.map((m, i) => (
                  <View
                    key={`mood-${i}-${m.date}-${m.mood}`}
                    style={[
                      styles.listItem,
                      i === moods.length - 1 && styles.listItemLast,
                    ]}
                  >
                    <View style={styles.listMain}>
                      <Text style={styles.listTitle}>
                        {formatShortDate(m.date)}
                      </Text>
                      <Text style={styles.listMeta}>Mood {m.mood}/5</Text>
                    </View>
                    <Text style={styles.moodEmoji} accessibilityLabel="Mood">
                      {m.mood >= 4 ? "🙂" : m.mood >= 3 ? "😐" : "😔"}
                    </Text>
                  </View>
                ))
              }
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent completions</Text>
              {completions.length === 0 ?
                <Text style={styles.emptyText}>
                  Finish today’s task to build your history here.
                </Text>
              : completions.map((c, i) => (
                  <View
                    key={`done-${i}-${c.date}-${c.taskId}`}
                    style={[
                      styles.listItem,
                      i === completions.length - 1 && styles.listItemLast,
                    ]}
                  >
                    <View style={styles.listMain}>
                      <Text style={styles.listTitle}>{taskTitleForId(c.taskId)}</Text>
                      <Text style={styles.listMeta}>{formatShortDate(c.date)}</Text>
                    </View>
                    <Ionicons name="checkmark-circle" size={22} color={W.primary} />
                  </View>
                ))
              }
            </View>
          </>
        )}

        <View style={[styles.card, styles.accountBlock]}>
          <Text style={styles.cardTitle}>Account</Text>
          {user ?
            <>
              <Text style={styles.accountName}>{user.name}</Text>
              <Text style={styles.accountEmail}>{user.email}</Text>
              <Pressable
                style={styles.signOut}
                onPress={() => void signOut()}
                accessibilityRole="button"
              >
                <Text style={styles.signOutText}>Sign out</Text>
              </Pressable>
            </>
          : <Text style={styles.emptyText}>Not signed in</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
