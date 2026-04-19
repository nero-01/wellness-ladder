import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { TaskStepIconWell } from "@/components/TaskStepCard"
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
    sectionLabel: {
      marginHorizontal: 20,
      marginBottom: 8,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: W.textMuted,
    },
    saRow: {
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 16,
      borderRadius: 16,
      backgroundColor: W.iconBg,
      borderWidth: 1,
      borderColor: W.primary,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    saBody: { flex: 1 },
    saTitle: { fontSize: 15, fontWeight: "700", color: W.text, marginBottom: 4 },
    saMeta: { fontSize: 13, color: W.textMuted, lineHeight: 18 },
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
    rowIcon: { alignItems: "center", justifyContent: "center" },
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

          <Text style={styles.sectionLabel}>South Africa · language & SADAG</Text>
          <Pressable
            style={({ pressed }) => [styles.saRow, pressed && { opacity: 0.92 }]}
            onPress={() => router.push("/dev-task-session?taskId=1")}
          >
            <View style={styles.saBody}>
              <Text style={styles.saTitle}>Task screen · Afrikaans ladder (day 1)</Text>
              <Text style={styles.saMeta}>
                Opens breathing task with the Language · Taal strip, 🇿🇦 flag, and
                English/Afrikaans menu. Try task IDs 1–7 for the full SA copy.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={W.textMuted} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.saRow, pressed && { opacity: 0.92 }]}
            onPress={() => router.push("/dev-celebration-preview")}
          >
            <View style={styles.saBody}>
              <Text style={styles.saTitle}>Post-done screen · SADAG tips</Text>
              <Text style={styles.saMeta}>
                Same view as after you finish today’s task: random tip, helplines,
                WhatsApp. Toggle EN/AF at the top.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={W.textMuted} />
          </Pressable>

          <Text style={styles.sectionLabel}>All catalog tasks</Text>

          {WELLNESS_TASKS.map((task) => (
            <Pressable
              key={task.id}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.92 }]}
              onPress={() =>
                router.push(`/dev-task-session?taskId=${String(task.id)}`)
              }
            >
              <View style={styles.rowIcon}>
                <TaskStepIconWell taskId={task.id} size={48} accessibilityLabel={task.title} />
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{task.title}</Text>
                <Text style={styles.rowMeta}>~{task.duration}s</Text>
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
