import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { Image } from "expo-image"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native"
import Animated, { FadeInDown } from "react-native-reanimated"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { CircularProgress } from "@/components/CircularProgress"
import { MoodPickerRow } from "@/components/MoodPickerRow"
import { MoodStreakBadge } from "@/components/MoodStreakBadge"
import { ResumeLadderBanner } from "@/components/ResumeLadderBanner"
import { Mascot } from "@/components/Mascot"
import { SupportHabitsSection } from "@/components/SupportHabitsSection"
import { StreakFlameBadge } from "@/components/StreakFlameBadge"
import {
  BreathingTaskVisual,
  BREATHING_TASK_ID,
} from "@/components/TaskScreen"
import { TaskCatalogPreview } from "@/components/TaskCatalogPreview"
import { TaskStepIconWell } from "@/components/TaskStepCard"
import { TaskTimerBar } from "@/components/TaskTimerBar"
import { VoiceRecorder } from "@/components/VoiceRecorder"
import { VoiceWaveformLottie } from "@/components/VoiceWaveformLottie"
import {
  wellnessCardInner,
  wellnessCardOuter,
  wellnessCardShadow,
} from "@/constants/wellnessSurface"
import {
  gapItem,
  gapSection,
  inset,
  padCard,
  padSection,
  radiusInner,
  radiusMd,
  radiusSm,
} from "@/constants/layoutTokens"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useTaskSessionTimer } from "@/hooks/useTaskSessionTimer"
import { useTaskVoiceGuidance } from "@/hooks/useTaskVoiceGuidance"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"
import { getMiloMoodItem } from "@/lib/milo-mood"
import { moodPastelAccent } from "@/lib/mood-pastels"
import { useWellnessLocale } from "@/lib/wellness-locale"
import {
  wellnessTapLight,
  wellnessTapMedium,
  wellnessTaskComplete,
  wellnessTimerFinished,
  wellnessWalkReady,
} from "@/lib/wellnessFeedback"
import type { Task } from "@/lib/wellness-data"
import { speakTask, stopTaskSpeech } from "@/utils/elevenlabs"

function createTaskSessionStyles(W: WellnessPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: "transparent" },
    scroll: { paddingHorizontal: inset, paddingBottom: 100 },
    scrollLocked: {
      flexGrow: 1,
      justifyContent: "center",
      paddingBottom: 20,
    },
    pressDim: { opacity: 0.85 },
    topBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    topBarRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    langStrip: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: gapSection,
      paddingVertical: 12,
      paddingHorizontal: padCard,
      borderRadius: radiusMd,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.bgElevated,
      gap: 12,
    },
    langStripLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      flex: 1,
      flexShrink: 1,
    },
    langStripTitles: { flex: 1, minWidth: 0 },
    langStripHeading: {
      fontSize: 14,
      fontWeight: "700",
      color: W.text,
    },
    langStripCaption: {
      fontSize: 12,
      color: W.textMuted,
      marginTop: 2,
    },
    langFlagStrip: { width: 32, height: 32, borderRadius: 4 },
    streakRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: gapSection,
    },
    /** Shadow only — inner gradient clips content so iOS shadow isn’t cut off */
    cardOuter: {
      marginBottom: gapSection,
      ...wellnessCardOuter(radiusMd),
    },
    card: {
      padding: padSection,
      ...wellnessCardInner(W, radiusMd),
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
    taskIconWrap: {
      alignSelf: "center",
      marginBottom: 8,
    },
    taskTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: W.text,
      textAlign: "center",
      lineHeight: 32,
      paddingHorizontal: 4,
    },
    taskInstruction: {
      fontSize: 17,
      color: W.primary,
      textAlign: "center",
      marginTop: 10,
      marginBottom: 4,
      lineHeight: 24,
      paddingHorizontal: 4,
    },
    voiceGuideBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      alignSelf: "center",
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: padCard,
      borderRadius: radiusInner,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
    },
    voiceGuideBtnDisabled: { opacity: 0.65 },
    voiceGuideLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: W.primary,
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
      borderRadius: radiusMd,
      alignItems: "center",
      ...wellnessCardShadow,
    },
    startCtaPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
    startCtaText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    stopWalkBtn: {
      marginTop: 14,
      paddingVertical: 14,
      borderRadius: radiusInner,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
      alignItems: "center",
    },
    stopWalkText: { color: W.text, fontSize: 16, fontWeight: "700" },
    keepGoing: {
      fontSize: 18,
      fontWeight: "600",
      color: W.primary,
      textAlign: "center",
      marginTop: 12,
    },
    actions: {
      flexDirection: "row",
      gap: gapItem,
      marginBottom: gapSection,
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
      borderRadius: radiusMd,
      opacity: 1,
    },
    doneBtnDisabled: { opacity: 0.45 },
    doneBtnPressed: { opacity: 0.92 },
    doneBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
    skipBtn: {
      width: 52,
      height: 52,
      borderRadius: radiusInner,
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
    devBanner: {
      marginBottom: 12,
      paddingVertical: 10,
      paddingHorizontal: padCard,
      borderRadius: radiusSm,
      backgroundColor: W.iconBg,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    devBannerText: {
      fontSize: 12,
      fontWeight: "600",
      color: W.primary,
      textAlign: "center",
    },
    langRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      flexShrink: 0,
    },
    langFlag: { width: 26, height: 26, borderRadius: 4 },
    langTrigger: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 8,
      borderRadius: radiusSm,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
    },
    langTriggerText: { fontSize: 13, fontWeight: "600", color: W.text },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
      justifyContent: "flex-start",
      paddingTop: 56,
      paddingHorizontal: inset,
      position: "relative",
    },
    langMenu: {
      borderRadius: radiusMd,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.bgElevated,
      overflow: "hidden",
    },
    langMenuItem: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: W.cardBorder,
    },
    langMenuItemLast: { borderBottomWidth: 0 },
    langMenuLabel: { fontSize: 16, fontWeight: "600", color: W.text },
    langMenuHint: { fontSize: 12, color: W.textMuted, marginTop: 2 },
    moodStrip: {
      marginBottom: gapSection,
      paddingVertical: 12,
      paddingHorizontal: padCard,
      borderRadius: radiusMd,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.bgElevated,
    },
    mascotCue: {
      alignItems: "center",
      marginBottom: 14,
      opacity: 0.95,
    },
    sessionCompanion: {
      alignItems: "center",
      marginTop: 4,
      marginBottom: 12,
      paddingHorizontal: 0,
    },
    inlineResultCard: {
      marginBottom: gapSection,
      paddingVertical: 14,
      paddingHorizontal: padCard,
      borderRadius: radiusMd,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.bgElevated,
    },
    inlineResultTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: W.text,
      marginBottom: 4,
    },
    inlineResultMeta: {
      fontSize: 13,
      color: W.textMuted,
      marginBottom: 10,
    },
    focusActions: {
      flexDirection: "row",
      gap: gapItem,
      marginBottom: gapSection,
      alignItems: "center",
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: radiusMd,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtnText: {
      color: W.text,
      fontSize: 16,
      fontWeight: "700",
    },
  })
}

const SA_FLAG_NOTO = "1f1ff-1f1e6"

function sessionUi(locale: "en" | "af", displayStreak: number) {
  if (locale === "af") {
    return {
      dayOnLadder: `Dag ${displayStreak} op die leer`,
      todayLabel: "Vandag se taak",
      hintManual:
        "Gebruik Begin stap en Stop stap vir die tyd. Die speaker gee stembegeleiding terwyl jy stap.",
      hintCountdown:
        "Tik die speaker vir kalmerende stem, of druk Begin om te begin.",
      startWalk: "Begin stap",
      continueWalk: "Gaan voort met stap",
      startTask: "Begin taak",
      stopWalk: "Stop stap",
      keepGoing: "Gaan voort...",
      done: "Klaar",
      moodRequiredTitle: "Kies eers jou bui",
      moodRequiredBody:
        "Jou bui word gebruik om jou stemming-streep te bereken. Kies ’n emoji hier onder.",
      voiceGuide: "Stemgids",
      voiceGuideSpeaking: "Besig om te praat…",
    }
  }
  return {
    dayOnLadder: `Day ${displayStreak} on the ladder`,
    todayLabel: "Today's Task",
    hintManual:
      "Use Start walk and Stop walk to control the timer. Speaker adds voice guidance while you walk.",
    hintCountdown: "Tap the speaker for calming voice guidance, or press Start",
    startWalk: "Start walk",
    continueWalk: "Continue walking",
    startTask: "Start Task",
    stopWalk: "Stop walk",
    keepGoing: "Keep going...",
    done: "Done",
    moodRequiredTitle: "Pick your mood first",
    moodRequiredBody:
      "Your mood powers your mood streak. Tap a mood below to continue.",
    voiceGuide: "Voice guide",
    voiceGuideSpeaking: "Speaking…",
  }
}

type Props = {
  task: Task
  displayStreak: number
  /** Consecutive days completed (before today’s finish). */
  streakCountForBadge: number
  /** Consecutive mood check-in days (stored streak). */
  moodStreakCount: number
  maxStreak: number
  pendingRecovery: boolean
  onDismissRecovery: () => void
  completeTask: (taskId: number, mood: number) => void
  /** Dev-only: run without saving streak; navigation returns to task list */
  previewMode?: boolean
}

export function TaskSession({
  task,
  displayStreak,
  streakCountForBadge,
  moodStreakCount,
  maxStreak,
  pendingRecovery,
  onDismissRecovery,
  completeTask,
  previewMode = false,
}: Props) {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const W = useWellnessColors()
  const styles = useMemo(() => createTaskSessionStyles(W), [W])
  const { locale, setLocale, ready: localeReady } = useWellnessLocale()
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const ui = useMemo(
    () => sessionUi(localeReady ? locale : "en", displayStreak),
    [locale, localeReady, displayStreak],
  )

  const saFlagUri = useMemo(
    () => emojiFamilySvgUrl(SA_FLAG_NOTO, "noto"),
    [],
  )

  const [flameDisplay, setFlameDisplay] = useState(streakCountForBadge)
  const [bumpKey, setBumpKey] = useState(0)
  const [mascotAttentionKey, setMascotAttentionKey] = useState(0)

  useEffect(() => {
    setFlameDisplay(streakCountForBadge)
  }, [streakCountForBadge])

  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [focusViewportHeight, setFocusViewportHeight] = useState(0)
  const [focusContentHeight, setFocusContentHeight] = useState(0)

  const moodStripAccent = useMemo(() => {
    const key =
      selectedMood != null ?
        getMiloMoodItem(selectedMood)?.pastelKey ?? "mint"
      : "mint"
    return moodPastelAccent(W.moodPastels, key)
  }, [selectedMood, W.moodPastels])

  const taskCardGradient = useMemo(
    () =>
      [
        moodPastelAccent(W.moodPastels, "lavender").idleFill,
        moodPastelAccent(W.moodPastels, "paleSky").idleFill,
        W.bgElevated,
      ] as const,
    [W],
  )
  const [isPlaying, setIsPlaying] = useState(false)
  const [voiceGuideBusy, setVoiceGuideBusy] = useState(false)
  const autoVoiceKeyRef = useRef<string | null>(null)

  const timer = useTaskSessionTimer(task, () => {
    setIsPlaying(false)
    wellnessTimerFinished()
  })

  const prevManualDone = useRef(false)
  useEffect(() => {
    prevManualDone.current = false
  }, [task.id])

  useEffect(() => {
    if (timer.mode !== "manual") {
      prevManualDone.current = false
      return
    }
    if (timer.timerCompleted && !prevManualDone.current) {
      wellnessWalkReady()
    }
    prevManualDone.current = timer.timerCompleted
  }, [timer.mode, timer.timerCompleted])

  const sessionActive =
    timer.mode === "countdown" ? timer.isActive : timer.walkPhase === "walking"

  const voiceEnabled = isPlaying && sessionActive

  useTaskVoiceGuidance({
    enabled: voiceEnabled,
    task,
    timeLeft: timer.timeLeft,
    duration: timer.duration,
    isActive: sessionActive,
    manualPhase: timer.mode === "manual" ? timer.walkPhase : undefined,
    manualElapsed: timer.mode === "manual" ? timer.elapsed : undefined,
    locale: localeReady ? locale : "en",
  })

  const goBackOrHome = useCallback(() => {
    if (previewMode) {
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace("/dev-task-preview")
      }
      return
    }
    router.push("/(tabs)")
  }, [previewMode, router])

  const ringProgress = useMemo(() => {
    if (timer.mode === "manual") {
      if (timer.timerCompleted) return 100
      const target = task.duration > 0 ? task.duration : 60
      return Math.min(100, (timer.elapsed / target) * 100)
    }
    if (timer.timerCompleted) return 100
    return task.duration > 0
      ? ((task.duration - timer.timeLeft) / task.duration) * 100
      : 0
  }, [timer, task.duration])

  const handleVoiceToggle = useCallback(() => {
    wellnessTapLight()
    setIsPlaying((prev) => !prev)
    if (timer.mode === "countdown") {
      if (!timer.isActive && timer.timeLeft === task.duration) {
        timer.start()
      }
    } else {
      if (timer.walkPhase === "idle") {
        timer.startWalk()
      } else if (timer.walkPhase === "stopped" && !timer.timerCompleted) {
        timer.resumeWalk()
      }
    }
  }, [timer, task.duration])

  const handleStart = useCallback(() => {
    wellnessTapMedium()
    setMascotAttentionKey((k) => k + 1)
    if (timer.mode === "manual") {
      if (timer.walkPhase === "stopped") timer.resumeWalk()
      else timer.startWalk()
    } else {
      timer.start()
    }
    setIsPlaying(true)
  }, [timer])

  const handleStopWalk = useCallback(() => {
    wellnessTapLight()
    if (timer.mode === "manual") timer.stopWalk()
  }, [timer])

  const handleVoiceGuide = useCallback(async (isAuto = false) => {
    if (!isAuto) wellnessTapLight()
    const lang = localeReady ? locale : "en"
    const line = `${task.title}. ${task.instruction}`
    setVoiceGuideBusy(true)
    try {
      await speakTask(line, lang)
    } finally {
      setVoiceGuideBusy(false)
    }
  }, [localeReady, locale, task.title, task.instruction])

  useEffect(() => {
    const key = `${task.id}:${localeReady ? locale : "en"}`
    if (autoVoiceKeyRef.current === key) return
    autoVoiceKeyRef.current = key
    void handleVoiceGuide(true)
  }, [task.id, locale, localeReady, handleVoiceGuide])

  useEffect(
    () => () => {
      void stopTaskSpeech()
    },
    [],
  )

  const handleComplete = useCallback(() => {
    wellnessTaskComplete()
    const mood = selectedMood ?? (previewMode ? 3 : null)
    if (mood === null) {
      Alert.alert(ui.moodRequiredTitle, ui.moodRequiredBody)
      return
    }
    if (previewMode) {
      Alert.alert(
        "Preview complete",
        "Dev run only — nothing saved to your streak.",
        [
          { text: "Back to task list", onPress: () => goBackOrHome() },
          { text: "Stay", style: "cancel" },
        ],
      )
      return
    }
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    setFlameDisplay((n) => n + 1)
    setBumpKey((k) => k + 1)
    setTimeout(() => {
      completeTask(task.id, mood)
    }, 420)
  }, [
    completeTask,
    goBackOrHome,
    previewMode,
    selectedMood,
    task.id,
    ui.moodRequiredBody,
    ui.moodRequiredTitle,
  ])

  const showStartSection =
    timer.mode === "countdown"
      ? !timer.isActive && timer.timeLeft === task.duration
      : timer.walkPhase === "idle" ||
        (timer.walkPhase === "stopped" && !timer.timerCompleted)

  const startLabel =
    timer.mode === "manual" && timer.walkPhase === "stopped"
      ? ui.continueWalk
      : timer.mode === "manual"
        ? ui.startWalk
        : ui.startTask

  const timerCompleted = timer.timerCompleted
  const hasStarted =
    timer.mode === "countdown"
      ? timer.isActive || timer.timeLeft < task.duration
      : timer.walkPhase !== "idle"
  const focusLocked = hasStarted
  const focusNeedsScroll =
    focusLocked &&
    focusViewportHeight > 0 &&
    focusContentHeight > focusViewportHeight - Math.max(insets.bottom, 12)

  const showVoiceWave = !focusLocked && sessionActive && isPlaying
  const completionSummary =
    timer.mode === "manual"
      ? `${Math.max(1, Math.round(timer.elapsed))}s walked`
      : `${Math.max(0, Math.round(task.duration - timer.timeLeft))}s completed`

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <ScrollView
          style={{ flex: 1, backgroundColor: "transparent" }}
          contentContainerStyle={[styles.scroll, focusLocked && styles.scrollLocked]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled={!focusLocked || focusNeedsScroll}
          onLayout={(e) => {
            setFocusViewportHeight(e.nativeEvent.layout.height)
          }}
          onContentSizeChange={(_, h) => {
            setFocusContentHeight(h)
          }}
        >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              wellnessTapLight()
              goBackOrHome()
            }}
            hitSlop={12}
            accessibilityLabel={focusLocked ? "Cancel task" : "Back to home"}
            style={({ pressed }) => pressed && styles.pressDim}
          >
            <Ionicons
              name={focusLocked ? "close" : "chevron-back"}
              size={26}
              color={W.text}
            />
          </Pressable>
          {!focusLocked ? (
          <View style={styles.topBarRight}>
            <Pressable
              onPress={() => {
                wellnessTapLight()
                router.push("/(tabs)/profile")
              }}
              hitSlop={12}
              style={({ pressed }) => pressed && styles.pressDim}
            >
              <Ionicons name="person-circle-outline" size={28} color={W.text} />
            </Pressable>
          </View>
          ) : (
            <View />
          )}
        </View>

        {!focusLocked ? (
        <View style={styles.langStrip}>
          <View style={styles.langStripLeft}>
            <Image
              source={{ uri: saFlagUri }}
              style={styles.langFlagStrip}
              contentFit="contain"
              accessibilityLabel="South Africa flag"
            />
            <View style={styles.langStripTitles}>
              <Text style={styles.langStripHeading}>Language · Taal</Text>
              <Text style={styles.langStripCaption} numberOfLines={2}>
                English or Afrikaans (first 7 ladder days). Voice uses en-US or af-ZA.
              </Text>
            </View>
          </View>
          <View style={styles.langRow}>
            <Pressable
              onPress={() => {
                wellnessTapLight()
                setLangMenuOpen(true)
              }}
              style={({ pressed }) => [styles.langTrigger, pressed && styles.pressDim]}
              accessibilityLabel="Choose language"
            >
              <Text style={styles.langTriggerText}>
                {locale === "af" ? "Afrikaans" : "English"}
              </Text>
              <Ionicons name="chevron-down" size={16} color={W.textMuted} />
            </Pressable>
          </View>
        </View>
        ) : null}

        {!focusLocked ? (
        <Modal
          visible={langMenuOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setLangMenuOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <Pressable
              style={StyleSheet.absoluteFillObject}
              onPress={() => setLangMenuOpen(false)}
              accessibilityLabel="Close language menu"
            />
            <View style={styles.langMenu}>
              <Pressable
                style={({ pressed }) => [
                  styles.langMenuItem,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => {
                  wellnessTapLight()
                  setLocale("en")
                  setLangMenuOpen(false)
                }}
              >
                <Text style={styles.langMenuLabel}>English</Text>
                <Text style={styles.langMenuHint}>Voice guidance: en-ZA</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.langMenuItem,
                  styles.langMenuItemLast,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={() => {
                  wellnessTapLight()
                  setLocale("af")
                  setLangMenuOpen(false)
                }}
              >
                <Text style={styles.langMenuLabel}>Afrikaans</Text>
                <Text style={styles.langMenuHint}>
                  Stem: af-ZA (op die toestel, werk offline)
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        ) : null}

        {!focusLocked && previewMode ? (
          <View style={styles.devBanner}>
            <Text style={styles.devBannerText}>
              DEV · Preview — streak not saved
            </Text>
          </View>
        ) : null}

        {!previewMode && pendingRecovery ? (
          <ResumeLadderBanner
            maxStreak={maxStreak}
            onResume={onDismissRecovery}
          />
        ) : null}

        <View style={styles.cardOuter}>
        <LinearGradient
          colors={[...taskCardGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.todayLabel}>{ui.todayLabel}</Text>
            <Pressable
              onPress={handleVoiceToggle}
              style={({ pressed }) => [
                styles.micBtn,
                isPlaying && styles.micActive,
                pressed && styles.pressDim,
              ]}
              accessibilityLabel={
                isPlaying ? "Calming voice guidance on" : "Voice guidance off"
              }
            >
              <Ionicons
                name={isPlaying ? "volume-high" : "volume-mute"}
                size={22}
                color={W.primary}
              />
            </Pressable>
          </View>

          <View style={styles.taskIconWrap}>
            <TaskStepIconWell
              taskId={task.id}
              size={64}
              accent
              accessibilityLabel={`Task: ${task.title}`}
            />
          </View>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskInstruction}>{task.instruction}</Text>

          {!focusLocked ? (
            <Pressable
              style={({ pressed }) => [
                styles.voiceGuideBtn,
                (pressed || voiceGuideBusy) && styles.voiceGuideBtnDisabled,
              ]}
              onPress={() => {
                void handleVoiceGuide()
              }}
              disabled={voiceGuideBusy}
              accessibilityRole="button"
              accessibilityLabel={ui.voiceGuide}
            >
              <Ionicons
                name={voiceGuideBusy ? "volume-high" : "chatbubble-ellipses-outline"}
                size={20}
                color={W.primary}
              />
              <Text style={styles.voiceGuideLabel}>
                {voiceGuideBusy ? ui.voiceGuideSpeaking : ui.voiceGuide}
              </Text>
            </Pressable>
          ) : null}

          {showVoiceWave ? (
            <VoiceWaveformLottie active color={W.primary} height={48} />
          ) : null}

          {timer.mode === "countdown" ? (
            <TaskTimerBar
              mode="countdown"
              timeLeft={timer.timeLeft}
              duration={task.duration}
            />
          ) : (
            <TaskTimerBar
              mode="manual"
              elapsed={timer.elapsed}
              targetSeconds={task.duration}
              walkPhase={timer.walkPhase}
              minSeconds={task.manualMinSeconds ?? 15}
            />
          )}

          {showStartSection ? (
            <>
              {!focusLocked ? (
                <>
                  <Text style={styles.hint}>
                    {timer.mode === "manual" ? ui.hintManual : ui.hintCountdown}
                  </Text>
                  <View style={styles.mascotCue}>
                    <Mascot
                      state="encouraging"
                      preset="taskCue"
                      attentionKey={mascotAttentionKey}
                      animated
                      locale={localeReady && locale === "af" ? "af" : "en"}
                    />
                  </View>
                </>
              ) : null}
              <Pressable
                style={({ pressed }) => [
                  styles.startCta,
                  pressed && styles.startCtaPressed,
                ]}
                onPress={handleStart}
              >
                <Text style={styles.startCtaText}>{startLabel}</Text>
              </Pressable>
            </>
          ) : null}

          {timer.mode === "manual" && timer.walkPhase === "walking" ? (
            <Pressable
              style={({ pressed }) => [
                styles.stopWalkBtn,
                pressed && styles.pressDim,
              ]}
              onPress={handleStopWalk}
              accessibilityRole="button"
              accessibilityLabel="Stop walk timer"
            >
              <Text style={styles.stopWalkText}>{ui.stopWalk}</Text>
            </Pressable>
          ) : null}

          {sessionActive && task.id === BREATHING_TASK_ID ? (
            <BreathingTaskVisual
              active={sessionActive}
              voiceEnabled={voiceEnabled}
              locale={localeReady ? locale : "en"}
            />
          ) : null}

        </LinearGradient>
        </View>

        {!focusLocked && sessionActive && task.id !== BREATHING_TASK_ID ? (
          <View style={styles.sessionCompanion}>
            <Mascot
              state="focused"
              preset="taskSession"
              motionProfile="calm"
              animated
              locale={localeReady && locale === "af" ? "af" : "en"}
            />
            <Text style={styles.keepGoing}>{ui.keepGoing}</Text>
          </View>
        ) : null}

        {focusLocked && timerCompleted ? (
          <Animated.View entering={FadeInDown.duration(280)}>
            <View style={styles.inlineResultCard}>
              <Text style={styles.inlineResultTitle}>Complete</Text>
              <Text style={styles.inlineResultMeta}>{completionSummary}</Text>
              <MoodPickerRow
                selectedMood={selectedMood}
                onMoodSelect={setSelectedMood}
                requiredForStreak={!previewMode}
                locale={localeReady && locale === "af" ? "af" : "en"}
              />
            </View>
          </Animated.View>
        ) : null}

        {!focusLocked ? (
          <View
            style={[
              styles.moodStrip,
              {
                borderLeftWidth: 4,
                borderLeftColor: moodStripAccent.border,
                backgroundColor: moodStripAccent.idleFill,
                borderColor: moodStripAccent.idleBorder,
              },
            ]}
          >
            <MoodPickerRow
              selectedMood={selectedMood}
              onMoodSelect={setSelectedMood}
              requiredForStreak={!previewMode}
              locale={localeReady && locale === "af" ? "af" : "en"}
            />
          </View>
        ) : null}

        {!focusLocked ? (
        <View style={styles.streakRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={{ fontSize: 12, color: W.textMuted, marginBottom: 6 }}>
              {ui.dayOnLadder}
            </Text>
            <StreakFlameBadge streakCount={flameDisplay} bumpKey={bumpKey} />
            <View style={{ height: 10 }} />
            <MoodStreakBadge moodStreak={moodStreakCount} bumpKey={bumpKey} />
          </View>
          <CircularProgress
            progress={ringProgress}
            label="1/1"
            size={64}
          />
        </View>
        ) : null}

        {!focusLocked ? <SupportHabitsSection previewMode={previewMode} /> : null}

        {!focusLocked && !previewMode ? <TaskCatalogPreview todayTaskId={task.id} /> : null}

        {!focusLocked ? (
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.doneBtn,
              (!timerCompleted || (!previewMode && selectedMood === null)) &&
                styles.doneBtnDisabled,
              pressed &&
                timerCompleted &&
                (previewMode || selectedMood !== null) &&
                styles.doneBtnPressed,
            ]}
            onPress={handleComplete}
            disabled={!timerCompleted || (!previewMode && selectedMood === null)}
          >
            <Ionicons name="checkmark-circle" size={22} color="#fff" />
            <Text style={styles.doneBtnText}>{ui.done}</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.skipBtn, pressed && styles.pressDim]}
            onPress={goBackOrHome}
          >
            <Ionicons name="play-skip-forward" size={22} color={W.textMuted} />
          </Pressable>
        </View>
        ) : null}

        {!focusLocked ? (
        <View style={styles.recorderSection}>
          <Text style={styles.recorderLabel}>Optional voice note</Text>
          <VoiceRecorder />
        </View>
        ) : null}

        {focusLocked ? (
          <View style={styles.focusActions}>
            {timerCompleted ? (
              <Pressable
                style={({ pressed }) => [styles.doneBtn, pressed && styles.doneBtnPressed]}
                onPress={handleComplete}
              >
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.doneBtnText}>{ui.done}</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={({ pressed }) => [styles.cancelBtn, pressed && styles.pressDim]}
              onPress={goBackOrHome}
              accessibilityRole="button"
              accessibilityLabel="Cancel task"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
          </View>
        ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
