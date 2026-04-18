import { useMemo } from "react"
import { ScrollView, StyleSheet, Text, View } from "react-native"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import type { Task } from "@/lib/wellness-data"
import { WELLNESS_TASKS } from "@/lib/wellness-data"
import { TaskNotoIcon } from "@/components/TaskNotoIcon"

function createCatalogStyles(W: WellnessPalette) {
  return StyleSheet.create({
    wrap: { marginTop: 8, marginBottom: 8 },
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
      marginBottom: 14,
    },
    row: {
      gap: 12,
      paddingRight: 8,
      paddingBottom: 4,
    },
    pill: {
      width: 132,
      padding: 12,
      borderRadius: 16,
      backgroundColor: W.surfaceMuted,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    pillToday: {
      borderColor: W.primary,
      backgroundColor: W.iconBg,
    },
    pillStep: {
      fontSize: 11,
      fontWeight: "600",
      color: W.textMuted,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    pillIconWrap: { alignItems: "center", marginBottom: 6 },
    pillTitle: {
      fontSize: 13,
      fontWeight: "600",
      color: W.text,
      minHeight: 34,
    },
    pillTitleToday: { color: W.primary },
    pillMeta: {
      fontSize: 11,
      color: W.textMuted,
      marginTop: 6,
    },
    todayTag: {
      marginTop: 8,
      alignSelf: "flex-start",
      backgroundColor: W.primary,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    todayTagText: {
      fontSize: 10,
      fontWeight: "700",
      color: "#fff",
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

  return (
    <View style={styles.wrap}>
      <Text style={styles.sectionTitle}>Ladder preview</Text>
      <Text style={styles.sectionSub}>
        One task unlocks per day along the ladder. Today’s step is highlighted.
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ backgroundColor: W.bg }}
        contentContainerStyle={styles.row}
      >
        {WELLNESS_TASKS.map((t: Task, index: number) => {
          const isToday = t.id === todayTaskId
          return (
            <View
              key={t.id}
              style={[styles.pill, isToday && styles.pillToday]}
            >
              <Text style={styles.pillStep}>Step {index + 1}</Text>
              <View style={styles.pillIconWrap}>
                <TaskNotoIcon
                  iconCode={t.iconCode}
                  size={30}
                  accessibilityLabel={`Step ${index + 1}: ${t.title}`}
                />
              </View>
              <Text
                style={[styles.pillTitle, isToday && styles.pillTitleToday]}
                numberOfLines={2}
              >
                {t.title}
              </Text>
              <Text style={styles.pillMeta}>~{t.duration}s</Text>
              {isToday ?
                <View style={styles.todayTag}>
                  <Text style={styles.todayTagText}>Today</Text>
                </View>
              : null}
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}
