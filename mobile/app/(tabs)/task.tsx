import { useMemo } from "react"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { TaskCompletionCelebration } from "@/components/TaskCompletionCelebration"
import { TaskSession } from "@/components/TaskSession"
import { WellnessColors as W } from "@/constants/wellnessTheme"
import { useStreak } from "@/hooks/useStreak"
import { getTodayTask } from "@/lib/wellness-data"

export default function TaskScreen() {
  const {
    streakData,
    isLoaded,
    completeTask,
    hasCompletedToday,
    displayStreak,
  } = useStreak()

  const task = useMemo(() => getTodayTask(displayStreak), [displayStreak])

  if (!isLoaded) {
    return (
      <View style={[styles.centered, { backgroundColor: W.bg }]}>
        <ActivityIndicator size="large" color={W.primary} />
      </View>
    )
  }

  if (hasCompletedToday) {
    return <TaskCompletionCelebration streakData={streakData} />
  }

  return (
    <TaskSession
      task={task}
      displayStreak={displayStreak}
      completeTask={completeTask}
    />
  )
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
})
