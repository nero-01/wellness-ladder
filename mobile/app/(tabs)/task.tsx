/**
 * Today’s task UI: layout, mood strip, timers, and voice guidance live in
 * `TaskSession` (ElevenLabs via Next.js `POST /api/voice/elevenlabs` — see `lib/elevenLabsProxy.ts`).
 */
import { useMemo } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { BrandedScreenBackdrop } from "@/components/BrandedScreenBackdrop"
import { MilestoneModal } from "@/components/MilestoneModal"
import { TaskCompletionCelebration } from "@/components/TaskCompletionCelebration"
import { TaskSession } from "@/components/TaskSession"
import { useStreak } from "@/hooks/useStreak"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { getTodayTask } from "@/lib/wellness-data"
import { moodPastelAccent } from "@/lib/mood-pastels"
import { useWellnessLocale } from "@/lib/wellness-locale"
import { localizeTaskForLocale } from "@/lib/za-afrikaans-tasks"

export default function TaskScreen() {
  const W = useWellnessColors()
  const loadAccent = moodPastelAccent(W.moodPastels, "mint")
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
      <BrandedScreenBackdrop style={styles.fill}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={loadAccent.navIcon} />
        </View>
      </BrandedScreenBackdrop>
    )
  }

  if (hasCompletedToday) {
    return (
      <BrandedScreenBackdrop style={styles.fill}>
        <TaskCompletionCelebration streakData={streakData} />
        <MilestoneModal
          visible={milestoneHit != null}
          milestone={milestoneHit}
          onClose={acknowledgeMilestone}
        />
      </BrandedScreenBackdrop>
    )
  }

  return (
    <BrandedScreenBackdrop style={styles.fill}>
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
    </BrandedScreenBackdrop>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
})
