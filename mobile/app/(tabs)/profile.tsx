import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { useMemo } from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { IS_DEV_BYPASS } from "@/constants/devBypass"
import { useAuth } from "@/contexts/AuthContext"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { Mascot } from "@/components/Mascot"
import { StreakHeatMap } from "@/components/StreakHeatMap"
import { useStreak } from "@/hooks/useStreak"
import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"
import { MILESTONE_NOTO, MOOD_MILESTONE_NOTO } from "@/lib/streak-rules"
import { isWellnessPro } from "@/lib/wellness-pro"
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
    devBadge: {
      alignSelf: "flex-start",
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: W.surfaceMuted,
      borderWidth: 1,
      borderColor: W.primary,
    },
    devBadgeText: { fontSize: 12, fontWeight: "800", color: W.primary },
    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginTop: 4,
    },
    badgeItem: { alignItems: "center", width: 72 },
    badgeImg: { width: 40, height: 40, marginBottom: 6 },
    badgeLabel: {
      fontSize: 11,
      color: W.textMuted,
      textAlign: "center",
      lineHeight: 14,
    },
    habitsRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    habitsLead: {
      fontSize: 14,
      color: W.textMuted,
      marginTop: 8,
      lineHeight: 20,
    },
  })
}

export default function ProfileScreen() {
  const W = useWellnessColors()
  const styles = useMemo(() => createStyles(W), [W])
  const { user, signOut } = useAuth()
  const { streakData, isLoaded } = useStreak()
  const pro = isWellnessPro()

  const moods = streakData.moodHistory.slice(-10).reverse()
  const completions = streakData.completionHistory.slice(-10).reverse()

  const completionDates = useMemo(
    () => new Set(streakData.completionHistory.map((c) => c.date)),
    [streakData.completionHistory],
  )

  const moodDates = useMemo(
    () => new Set(streakData.moodHistory.map((m) => m.date)),
    [streakData.moodHistory],
  )

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        style={{ flex: 1, backgroundColor: W.bg }}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>
            Your streak, completed tasks, and mood check-ins stay on this device.
          </Text>
        </View>

        <Link href="/recurring-habits" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.card,
              { marginTop: 4 },
              pressed && { opacity: 0.92 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Recurring habits"
          >
            <View style={styles.habitsRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Recurring habits</Text>
                <Text style={styles.habitsLead}>
                  Small optional reminders — not your main daily task.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={W.textMuted} />
            </View>
          </Pressable>
        </Link>

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
                  {streakData.currentStreak} days
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Best streak</Text>
                <Text style={styles.statValue}>{streakData.maxStreak} days</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Tasks completed (all time)</Text>
                <Text style={styles.statValue}>{streakData.totalCompleted}</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Mood streak</Text>
                <Text style={styles.statValue}>{streakData.moodStreak} days</Text>
              </View>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Best mood streak</Text>
                <Text style={styles.statValue}>{streakData.maxMoodStreak} days</Text>
              </View>
              <View style={[styles.statRow, styles.statRowLast]}>
                <Text style={styles.statLabel}>Last completed</Text>
                <Text style={[styles.statValue, { fontSize: 16 }]}>
                  {streakData.lastCompletedDate ?
                    formatShortDate(streakData.lastCompletedDate)
                  : "—"}
                </Text>
              </View>
              {pro ?
                <Text style={styles.statHint}>
                  Pro: longer streak grace (extra days before your chain resets).
                </Text>
              : null}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Task heat map</Text>
              <StreakHeatMap completionDates={completionDates} weeks={5} />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mood check-ins</Text>
              <StreakHeatMap
                completionDates={moodDates}
                weeks={5}
                title="Check-ins"
                hint="Green = logged a mood that day"
                activeColor="#22c55e"
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Task badges</Text>
              {streakData.milestonesUnlocked.length === 0 ?
                <Text style={styles.emptyText}>
                  Hit 2, 3, and 7-day task streaks to earn badges.
                </Text>
              : <View style={styles.badgeRow}>
                  {streakData.milestonesUnlocked.map((id) => {
                    const meta = MILESTONE_NOTO[id]
                    const uri = emojiFamilySvgUrl(meta.code, "noto")
                    return (
                      <View key={id} style={styles.badgeItem}>
                        <Image
                          source={{ uri }}
                          style={styles.badgeImg}
                          contentFit="contain"
                          cachePolicy="memory-disk"
                        />
                        <Text style={styles.badgeLabel}>{meta.label}</Text>
                      </View>
                    )
                  })}
                </View>
              }
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Mood check-in badges</Text>
              {streakData.moodMilestonesUnlocked.length === 0 ?
                <Text style={styles.emptyText}>
                  Hit 3, 7, and 14-day mood streaks for bronze, silver, and gold.
                </Text>
              : <View style={styles.badgeRow}>
                  {streakData.moodMilestonesUnlocked.map((id) => {
                    const meta = MOOD_MILESTONE_NOTO[id]
                    const uri = emojiFamilySvgUrl(meta.code, "noto")
                    return (
                      <View key={id} style={styles.badgeItem}>
                        <Image
                          source={{ uri }}
                          style={styles.badgeImg}
                          contentFit="contain"
                          cachePolicy="memory-disk"
                        />
                        <Text style={styles.badgeLabel}>{meta.label}</Text>
                      </View>
                    )
                  })}
                </View>
              }
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
                      {m.mood >= 5 ? "😊" : m.mood >= 4 ? "😐" : m.mood >= 3 ? "😟" : m.mood >= 2 ? "😠" : "😢"}
                    </Text>
                  </View>
                ))
              }
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent completions</Text>
              {completions.length === 0 ?
                <View style={{ alignItems: "center", paddingVertical: 8 }}>
                  <Mascot state="sleepy" size={80} animated />
                  <Text style={[styles.emptyText, { marginTop: 12, textAlign: "center" }]}>
                    Finish today’s task to build your history here.
                  </Text>
                </View>
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
          {IS_DEV_BYPASS ? (
            <View style={styles.devBadge} accessibilityLabel="Development mode">
              <Text style={styles.devBadgeText}>DEV MODE 🚀</Text>
            </View>
          ) : null}
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
