import * as Haptics from "expo-haptics"
import { useCallback, useMemo, useState } from "react"
import { Pressable, StyleSheet } from "react-native"
import { Text, View } from "@/components/Themed"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { WellnessColors } from "@/constants/wellnessTheme"
import { getTodayTask } from "@/lib/wellness-data"

export default function TaskScreen() {
  const streakDay = 1
  const task = useMemo(() => getTodayTask(streakDay), [streakDay])
  const [done, setDone] = useState(false)

  const onComplete = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setDone(true)
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{task.icon}</Text>
      <Text style={styles.title}>{task.title}</Text>
      <Text style={styles.instruction}>{task.instruction}</Text>
      <Text style={styles.meta}>~{task.duration}s</Text>

      <Pressable
        style={[styles.cta, done && styles.ctaDone]}
        onPress={onComplete}
        disabled={done}
      >
        <Text style={styles.ctaText}>{done ? "Done today" : "Mark complete"}</Text>
      </Pressable>

      <VoiceRecorder />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 48,
    gap: 12,
    backgroundColor: WellnessColors.bg,
  },
  emoji: { fontSize: 48, marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  instruction: { fontSize: 16, textAlign: "center", opacity: 0.85 },
  meta: { fontSize: 14, opacity: 0.6, marginBottom: 16 },
  cta: {
    backgroundColor: "#6b4d8a",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 8,
  },
  ctaDone: { opacity: 0.7 },
  ctaText: { color: "#fff", fontWeight: "600", fontSize: 16 },
})
