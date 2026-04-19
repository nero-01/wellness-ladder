import { useRouter } from "expo-router"
import { useMemo } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import { TaskStepCatalogCard } from "@/components/TaskStepCard"
import { gapSection, inset } from "@/constants/layoutTokens"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import type { Task } from "@/lib/wellness-data"
import { WELLNESS_TASKS } from "@/lib/wellness-data"

function createCatalogStyles(W: WellnessPalette) {
  return StyleSheet.create({
    wrap: { marginTop: gapSection / 2, marginBottom: gapSection / 2 },
    sectionTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: W.text,
      marginBottom: 6,
    },
    sectionSub: {
      fontSize: 13,
      color: W.textMuted,
      lineHeight: 18,
      marginBottom: 12,
    },
    row: {
      gap: 12,
      paddingRight: inset,
      paddingBottom: 2,
    },
  })
}

type Props = {
  /** Task id scheduled for today (from getTodayTask) */
  todayTaskId: number
}

export function TaskCatalogPreview({ todayTaskId }: Props) {
  const W = useWellnessColors()
  const styles = useMemo(() => createCatalogStyles(W), [W])
  const router = useRouter()

  const goToTask = () => {
    router.push("/(tabs)/task")
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>Ladder preview</Text>
      <Text style={styles.sectionSub}>
        One task unlocks per day along the ladder. Today’s step is highlighted — tap any card to
        open your task.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {WELLNESS_TASKS.map((t: Task, index: number) => {
          const isToday = t.id === todayTaskId
          return (
            <TaskStepCatalogCard
              key={t.id}
              task={t}
              stepNumber={index + 1}
              variant={isToday ? "today" : "muted"}
              onPress={goToTask}
            />
          )
        })}
      </ScrollView>
    </View>
  )
}
