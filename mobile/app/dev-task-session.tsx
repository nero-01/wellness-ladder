import { useLocalSearchParams } from "expo-router"
import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { TaskSession } from "@/components/TaskSession"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { WELLNESS_TASKS } from "@/lib/wellness-data"

export default function DevTaskSessionScreen() {
  const { taskId: rawId } = useLocalSearchParams<{ taskId: string }>()
  const W = useWellnessColors()

  const task = useMemo(() => {
    const id = Number(rawId)
    if (!Number.isFinite(id)) return undefined
    return WELLNESS_TASKS.find((t) => t.id === id)
  }, [rawId])

  if (!task) {
    return (
      <View style={[styles.center, { backgroundColor: W.bg }]}>
        <Text style={{ color: W.textMuted }}>Unknown task</Text>
      </View>
    )
  }

  return (
    <TaskSession
      task={task}
      displayStreak={task.id}
      streakCountForBadge={0}
      moodStreakCount={0}
      maxStreak={0}
      pendingRecovery={false}
      onDismissRecovery={() => {}}
      completeTask={() => {}}
      previewMode
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
})
