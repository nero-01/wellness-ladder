import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { TaskNotoIcon } from "@/components/TaskNotoIcon"
import { WELLNESS_TASKS } from "@/lib/wellness-data"

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: W.bg },
    scroll: { paddingBottom: 32 },
    banner: {
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 14,
      borderRadius: 14,
      backgroundColor: W.iconBg,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    bannerTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: W.primary,
      marginBottom: 6,
    },
    bannerBody: { fontSize: 13, color: W.textMuted, lineHeight: 18 },
    row: {
      marginHorizontal: 20,
      marginBottom: 10,
      padding: 16,
      borderRadius: 16,
      backgroundColor: W.bgElevated,
      borderWidth: 1,
      borderColor: W.cardBorder,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    rowIcon: { width: 44, height: 44 },
    rowBody: { flex: 1 },
    rowTitle: { fontSize: 16, fontWeight: "700", color: W.text },
    rowMeta: { fontSize: 13, color: W.textMuted, marginTop: 4 },
    chev: { opacity: 0.5 },
  })
}

/**
 * Dev-only: open from Home when __DEV__ to run any catalog task without ladder unlock.
 * Not linked in production builds.
 */
export default function DevTaskPreviewScreen() {
  const router = useRouter()
  const W = useWellnessColors()
  const styles = useMemo(() => createStyles(W), [W])

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
        <ScrollView
          style={{ flex: 1, backgroundColor: W.bg }}
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>Development preview</Text>
            <Text style={styles.bannerBody}>
              Tap a task to run the full timer and voice flow. Nothing is saved to
              your streak. The shipped app only surfaces today’s unlocked step.
            </Text>
          </View>

          {WELLNESS_TASKS.map((task) => (
            <Pressable
              key={task.id}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
              onPress={() =>
                router.push(`/dev-task-session?taskId=${String(task.id)}`)
              }
            >
              <TaskNotoIcon
                iconCode={task.iconCode}
                size={40}
                accessibilityLabel={task.title}
                style={styles.rowIcon}
              />
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{task.title}</Text>
                <Text style={styles.rowMeta}>
                  ~{task.duration}s · id {task.id}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={W.textMuted}
                style={styles.chev}
              />
            </Pressable>
          ))}
        </ScrollView>
    </SafeAreaView>
  )
}
