import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { CircularProgress } from "@/components/CircularProgress"
import { MoodPickerRow } from "@/components/MoodPickerRow"
import { TaskCatalogPreview } from "@/components/TaskCatalogPreview"
import { TaskTimerBar } from "@/components/TaskTimerBar"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { useTimer } from "@/hooks/useTimer"
import { getBreathingPhaseLabel, type Task } from "@/lib/wellness-data"

function createTaskSessionStyles(W: WellnessPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: W.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 32 },
    pressDim: { opacity: 0.85 },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    topBarRight: { flexDirection: "row", alignItems: "center", gap: 12 },
    streakRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: W.iconBg,
    },
    streakText: { fontWeight: "700", fontSize: 17, color: W.text },
    streakFlame: { fontSize: 20 },
    card: {
      backgroundColor: W.bgElevated,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: W.cardBorder,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    cardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    todayLabel: { fontSize: 13, color: W.textMuted },
    micBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    micActive: { backgroundColor: W.iconBg },
    emoji: {
      fontSize: 48,
      textAlign: "center",
      marginBottom: 8,
    },
    taskTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: W.text,
      textAlign: "center",
      lineHeight: 26,
    },
    taskInstruction: {
      fontSize: 16,
      color: W.primary,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 4,
    },
    hint: {
      fontSize: 13,
      color: W.textMuted,
      textAlign: "center",
      marginTop: 8,
      marginBottom: 12,
    },
    startCta: {
      backgroundColor: W.primary,
      paddingVertical: 16,
      borderRadius: 18,
      alignItems: "center",
      shadowColor: W.primary,
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    startCtaPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    startCtaText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    breathing: {
      fontSize: 18,
      fontWeight: "600",
      color: W.primary,
      textAlign: "center",
      marginTop: 12,
    },
    keepGoing: {
      fontSize: 18,
      fontWeight: "600",
      color: W.primary,
      textAlign: "center",
      marginTop: 12,
    },
    actions: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 20,
      alignItems: "center",
    },
    doneBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: W.primary,
      paddingVertical: 16,
      borderRadius: 18,
      opacity: 1,
    },
    doneBtnDisabled: { opacity: 0.45 },
    doneBtnPressed: { opacity: 0.92 },
    doneBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
    skipBtn: {
      width: 52,
      height: 52,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: W.cardBorder,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: W.surfaceMuted,
    },
    recorderSection: { marginTop: 8 },
    recorderLabel: {
      fontSize: 12,
      color: W.textMuted,
      marginBottom: 8,
      textAlign: "center",
    },
  })
}

type Props = {
  task: Task
  displayStreak: number
  completeTask: (taskId: number, mood?: number) => void
}

export function TaskSession({ task, displayStreak, completeTask }: Props) {
  const router = useRouter()
  const W = useWellnessColors()
  const styles = useMemo(() => createTaskSessionStyles(W), [W])

  function StreakBadge({ days }: { days: number }) {
    return (
      <View style={styles.streakBadge}>
        <Text style={styles.streakText}>Day {days}</Text>
        <Text style={styles.streakFlame} accessibilityLabel="streak">
          🔥
        </Text>
      </View>
    )
  }

  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const {
    timeLeft,
    isActive,
    isCompleted: timerCompleted,
    start: startTimer,
  } = useTimer({
    duration: task.duration,
    onComplete: () => setIsPlaying(false),
  })

  const breathingPhase = useMemo(
    () => getBreathingPhaseLabel(task.id, task.duration, timeLeft),
    [task.id, task.duration, timeLeft],
  )
  const pulse = useRef(new Animated.Value(1)).current

  useEffect(() => {
    if (!breathingPhase) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.65,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [breathingPhase, pulse])

  const handleVoiceToggle = useCallback(() => {
    setIsPlaying((prev) => !prev)
    if (!isActive && timeLeft === task.duration) {
      startTimer()
    }
  }, [isActive, timeLeft, task.duration, startTimer])

  const handleStart = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    startTimer()
    setIsPlaying(true)
  }, [startTimer])

  const handleComplete = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    completeTask(task.id, selectedMood ?? undefined)
  }, [completeTask, task.id, selectedMood])

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.push("/(tabs)")}
            hitSlop={12}
            accessibilityLabel="Back to home"
            style={({ pressed }) => pressed && styles.pressDim}
          >
            <Ionicons name="chevron-back" size={26} color={W.text} />
          </Pressable>
          <View style={styles.topBarRight}>
            <Pressable
              onPress={() => router.push("/(tabs)/profile")}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.pressDim}
            >
              <Ionicons name="person-circle-outline" size={28} color={W.text} />
            </Pressable>
          </View>
        </View>

        <TaskCatalogPreview todayTaskId={task.id} />

        <View style={styles.streakRow}>
          <StreakBadge days={displayStreak} />
          <CircularProgress
            progress={timerCompleted ? 100 : 0}
            label="1/1"
            size={64}
          />
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.todayLabel}>{"Today's"} Task</Text>
            <Pressable
              onPress={handleVoiceToggle}
              style={({ pressed }) => [
                styles.micBtn,
                isPlaying && styles.micActive,
                pressed && styles.pressDim,
              ]}
              accessibilityLabel={
                isPlaying ? "Voice guidance on" : "Voice guidance off"
              }
            >
              <Ionicons
                name={isPlaying ? "volume-high" : "volume-mute"}
                size={22}
                color={W.primary}
              />
            </Pressable>
          </View>

          <Text style={styles.emoji}>{task.icon}</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskInstruction}>{task.instruction}</Text>

          <TaskTimerBar timeLeft={timeLeft} duration={task.duration} />

          {!isActive && timeLeft === task.duration ? (
            <>
              <Text style={styles.hint}>
                Tap the voice icon or start button to begin
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.startCta,
                  pressed && styles.startCtaPressed,
                ]}
                onPress={handleStart}
              >
                <Text style={styles.startCtaText}>Start Task</Text>
              </Pressable>
            </>
          ) : null}

          {isActive && breathingPhase ? (
            <Animated.Text style={[styles.breathing, { opacity: pulse }]}>
              {breathingPhase}
            </Animated.Text>
          ) : null}

          {isActive && !breathingPhase ? (
            <Text style={styles.keepGoing}>Keep going...</Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.doneBtn,
              !timerCompleted && styles.doneBtnDisabled,
              pressed && timerCompleted && styles.doneBtnPressed,
            ]}
            onPress={handleComplete}
            disabled={!timerCompleted}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.skipBtn, pressed && styles.pressDim]}
            onPress={() => router.push("/(tabs)")}
          >
            <Ionicons name="play-skip-forward" size={22} color={W.textMuted} />
          </Pressable>
        </View>

        <MoodPickerRow
          selectedMood={selectedMood}
          onMoodSelect={setSelectedMood}
        />

        <View style={styles.recorderSection}>
          <Text style={styles.recorderLabel}>Optional voice note</Text>
          <VoiceRecorder />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
