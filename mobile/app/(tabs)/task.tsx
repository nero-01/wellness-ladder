import { useMemo } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { MilestoneModal } from "@/components/MilestoneModal"
import { TaskCompletionCelebration } from "@/components/TaskCompletionCelebration"
import { TaskSession } from "@/components/TaskSession"
import { useStreak } from "@/hooks/useStreak"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { getTodayTask } from "@/lib/wellness-data"
import { useWellnessLocale } from "@/lib/wellness-locale"
import { localizeTaskForLocale } from "@/lib/za-afrikaans-tasks"

export default function TaskScreen() {
  const W = useWellnessColors()
  const { locale, ready: localeReady } = useWellnessLocale()
  const {
    streakData,
    isLoaded,
    completeTask,
    hasCompletedToday,
    displayStreak,
    streakCountForBadge,
    milestoneHit,
    acknowledgeMilestone,
    pendingRecovery,
    dismissRecovery,
  } = useStreak()

  const task = useMemo(() => {
    const base = getTodayTask(displayStreak)
    if (!localeReady) return base
    return localizeTaskForLocale(base, displayStreak, locale)
  }, [displayStreak, locale, localeReady])

  if (!isLoaded) {
    return (
      <View style={[styles.centered, { backgroundColor: W.bg }]}>
        <ActivityIndicator size="large" color={W.primary} />
      </View>
    )
  }

  if (hasCompletedToday) {
    return (
      <>
        <TaskCompletionCelebration streakData={streakData} />
        <MilestoneModal
          visible={milestoneHit != null}
          milestone={milestoneHit}
          onClose={acknowledgeMilestone}
        />
      </>
    )
  }

  return (
    <TaskSession
      task={task}
      displayStreak={displayStreak}
      streakCountForBadge={streakCountForBadge}
      moodStreakCount={streakData.moodStreak}
      maxStreak={streakData.maxStreak}
      pendingRecovery={pendingRecovery}
      onDismissRecovery={dismissRecovery}
      completeTask={completeTask}
    />
  )
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
})
