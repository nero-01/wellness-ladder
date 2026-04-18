import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "expo-status-bar"
import { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import { useColorScheme } from "@/components/useColorScheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import type { WalkPhase } from "@/hooks/useTaskSessionTimer"
import { speakGuidanceLine } from "@/lib/guidanceTts"
import { wellnessTapLight } from "@/lib/wellnessFeedback"
import type { WellnessLocale } from "@/lib/wellness-locale"
import {
  getSpeechLocaleCode,
  localizeBreathingPhase,
} from "@/lib/za-afrikaans-tasks"

/** Matches `WELLNESS_TASKS` id for “Take 3 Deep Breaths”. */
export const BREATHING_TASK_ID = 1 as const

const ANIM_MAX = 250

/** Stable slug per catalog task for immersive `TaskRenderer`. */
export type TaskSlug =
  | "deep-breaths"
  | "gratitude"
  | "stretch"
  | "walk"
  | "journal"
  | "hydration"
  | "reflect"
  | "shoulder-release"
  | "screen-break"
  | "self-words"
  | "neck-care"
  | "green-glance"
  | "posture"
  | "wrist-hand"
  | "listening"
  | "soft-smile"
  | "ground-feet"
  | "upper-back"
  | "mindful-sip"
  | "shoulder-blade"
  | "jaw-release"
  | "finger-spreads"
  | "thankful-breath"
  | "tomorrow-step"
  | "generic"

export function taskSlugFromTaskId(id: number): TaskSlug {
  const m: Record<number, TaskSlug> = {
    1: "deep-breaths",
    2: "gratitude",
    3: "stretch",
    4: "walk",
    5: "journal",
    6: "hydration",
    7: "reflect",
    8: "shoulder-release",
    9: "screen-break",
    10: "self-words",
    11: "neck-care",
    12: "green-glance",
    13: "posture",
    14: "wrist-hand",
    15: "listening",
    16: "soft-smile",
    17: "ground-feet",
    18: "upper-back",
    19: "mindful-sip",
    20: "shoulder-blade",
    21: "jaw-release",
    22: "finger-spreads",
    23: "thankful-breath",
    24: "tomorrow-step",
  }
  return m[id] ?? "generic"
}

type BreathPhaseKey = "Inhale" | "Hold" | "Exhale"

/** 12s cycle: 4s inhale / 4s hold / 4s exhale */
const INHALE_MS = 4000
const HOLD_MS = 4000
const EXHALE_MS = 4000

const TTS_EN: Record<BreathPhaseKey, string> = {
  Inhale: "Breathe in...",
  Hold: "Hold...",
  Exhale: "Breathe out...",
}

function displayLabel(phase: BreathPhaseKey, locale: WellnessLocale): string {
  if (locale === "af") {
    const m: Record<BreathPhaseKey, string> = {
      Inhale: "Inasem",
      Hold: "Hou",
      Exhale: "Uitasem",
    }
    return m[phase]
  }
  return phase
}

function secondsForPhase(_phase: BreathPhaseKey): string {
  return "4s"
}

type BreathingTaskVisualProps = {
  active: boolean
  voiceEnabled: boolean
  locale: WellnessLocale
}

export function BreathingTaskVisual({
  active,
  voiceEnabled,
  locale,
}: BreathingTaskVisualProps) {
  const W = useWellnessColors()
  const scale = useSharedValue(0.6)
  const [breathPhase, setBreathPhase] = useState<BreathPhaseKey>("Inhale")

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { alignItems: "center", marginVertical: 8 },
        phase: {
          fontSize: 22,
          fontWeight: "600",
          textAlign: "center",
          marginTop: 6,
        },
        seconds: {
          fontSize: 36,
          fontWeight: "800",
          textAlign: "center",
          marginTop: 2,
        },
        hint: {
          fontSize: 15,
          textAlign: "center",
          marginTop: 10,
          paddingHorizontal: 8,
          lineHeight: 20,
        },
        circleOuter: {
          width: ANIM_MAX,
          height: ANIM_MAX,
          alignSelf: "center",
          borderRadius: ANIM_MAX / 2,
          overflow: "hidden",
          borderWidth: 3,
          borderColor: W.primary,
        },
        gradientFill: { flex: 1, borderRadius: ANIM_MAX / 2 - 3 },
      }),
    [W.primary],
  )

  const speakLine = useCallback(
    (en: string) => {
      if (!voiceEnabled) return
      const line = localizeBreathingPhase(en, locale) ?? en
      void speakGuidanceLine(line, { language: getSpeechLocaleCode(locale) })
    },
    [voiceEnabled, locale],
  )

  const emitPhase = useCallback(
    (p: BreathPhaseKey) => {
      setBreathPhase(p)
      wellnessTapLight()
      speakLine(TTS_EN[p])
    },
    [speakLine],
  )

  const onHold = useCallback(() => emitPhase("Hold"), [emitPhase])
  const onExhale = useCallback(() => emitPhase("Exhale"), [emitPhase])
  const onInhale = useCallback(() => emitPhase("Inhale"), [emitPhase])

  useEffect(() => {
    if (!active) {
      cancelAnimation(scale)
      scale.value = 0.6
      setBreathPhase("Inhale")
      return
    }

    scale.value = 0.6
    setBreathPhase("Inhale")
    speakLine(TTS_EN.Inhale)

    scale.value = withRepeat(
      withSequence(
        withTiming(
          1,
          {
            duration: INHALE_MS,
            easing: Easing.inOut(Easing.ease),
          },
          (finished) => {
            if (finished) runOnJS(onHold)()
          },
        ),
        withTiming(1, { duration: HOLD_MS }, (finished) => {
          if (finished) runOnJS(onExhale)()
        }),
        withTiming(
          0.6,
          {
            duration: EXHALE_MS,
            easing: Easing.inOut(Easing.ease),
          },
          (finished) => {
            if (finished) runOnJS(onInhale)()
          },
        ),
      ),
      -1,
      false,
    )

    return () => {
      cancelAnimation(scale)
    }
  }, [active, onExhale, onHold, onInhale, scale, speakLine])

  const animatedCircle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowColor: W.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2 + scale.value * 0.45,
    shadowRadius: 6 + scale.value * 22,
    elevation: 4 + scale.value * 10,
  }))

  const gradientColors = useMemo(
    () => [withAlpha(W.primary, "55"), withAlpha(W.primary, "18")] as [string, string],
    [W.primary],
  )

  return (
    <View style={styles.wrap}>
      <Animated.View style={[animatedCircle, styles.circleOuter]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={styles.gradientFill}
        />
      </Animated.View>

      <Text style={[styles.phase, { color: W.textMuted }]}>
        {displayLabel(breathPhase, locale)}
      </Text>
      <Text style={[styles.seconds, { color: W.text }]}>
        {secondsForPhase(breathPhase)}
      </Text>

      <Text style={[styles.hint, { color: W.textMuted }]}>
        {locale === "af"
          ? "Volg die sirkel: Inasem, hou, uitasem"
          : "Follow the circle: Inhale, hold, exhale"}
      </Text>
    </View>
  )
}

function GenericPulseCircle({ active }: { active: boolean }) {
  const W = useWellnessColors()
  const s = useSharedValue(1)
  useEffect(() => {
    if (!active) {
      cancelAnimation(s)
      s.value = 1
      return
    }
    s.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    return () => cancelAnimation(s)
  }, [active, s])
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: s.value }],
  }))
  return (
    <View style={immersiveStyles.animWrap}>
      <Animated.View
        style={[
          style,
          {
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: withAlpha(W.primary, "33"),
            borderWidth: 2,
            borderColor: W.primary,
          },
        ]}
      />
    </View>
  )
}

function GratitudeHeartPulse({ t }: { t: SharedValue<number> }) {
  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + Math.sin(t.value * Math.PI * 2) * 0.08 }],
  }))
  return (
    <Animated.View style={style}>
      <Text style={{ fontSize: 72 }}>💜</Text>
    </Animated.View>
  )
}

function GratitudeSparkle({ active }: { active: boolean }) {
  const t = useSharedValue(0)
  useEffect(() => {
    if (!active) {
      cancelAnimation(t)
      t.value = 0
      return
    }
    t.value = withRepeat(withTiming(1, { duration: 4000, easing: Easing.linear }), -1, false)
    return () => cancelAnimation(t)
  }, [active, t])

  const spots = useMemo(
    () =>
      [
        { x: -40, y: -50, s: 0.9, delay: 0 },
        { x: 50, y: -30, s: 0.7, delay: 0.15 },
        { x: -30, y: 40, s: 0.8, delay: 0.3 },
        { x: 45, y: 45, s: 0.65, delay: 0.45 },
        { x: 0, y: -70, s: 0.75, delay: 0.6 },
      ] as const,
    [],
  )

  return (
    <View style={immersiveStyles.animWrap}>
      <GratitudeHeartPulse t={t} />
      {spots.map((p, i) => (
        <SparkleDot key={i} t={t} offset={p} delay={p.delay} />
      ))}
    </View>
  )
}

function SparkleDot({
  t,
  offset,
  delay,
}: {
  t: SharedValue<number>
  offset: { x: number; y: number; s: number }
  delay: number
}) {
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(
      (t.value + delay) % 1,
      [0, 0.5, 1],
      [0.35, 1, 0.35],
    ),
    transform: [
      { translateX: offset.x },
      { translateY: offset.y },
      { scale: offset.s },
    ],
  }))
  return (
    <Animated.Text style={[immersiveStyles.sparkle, style]} accessibilityElementsHidden>
      ✨
    </Animated.Text>
  )
}

function StretchArmsAnimation({ active }: { active: boolean }) {
  const W = useWellnessColors()
  const a = useSharedValue(0)
  useEffect(() => {
    if (!active) {
      cancelAnimation(a)
      a.value = 0
      return
    }
    a.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    return () => cancelAnimation(a)
  }, [active, a])
  const leftArm = useAnimatedStyle(() => ({
    transform: [{ rotate: `${-45 + a.value * 45}deg` }],
  }))
  const rightArm = useAnimatedStyle(() => ({
    transform: [{ rotate: `${45 - a.value * 45}deg` }],
  }))
  return (
    <View style={immersiveStyles.animWrap}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 24, height: 80 }}>
        <Animated.View
          style={[
            leftArm,
            {
              width: 80,
              height: 10,
              borderRadius: 5,
              backgroundColor: W.primary,
              opacity: 0.85,
            },
          ]}
        />
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: W.iconBg }} />
        <Animated.View
          style={[
            rightArm,
            {
              width: 80,
              height: 10,
              borderRadius: 5,
              backgroundColor: W.primary,
              opacity: 0.85,
            },
          ]}
        />
      </View>
      <Text style={{ marginTop: 12, color: W.textMuted, fontSize: 13, fontWeight: "600" }}>
        Reach
      </Text>
    </View>
  )
}

function WalkingFeetAnimation({
  active,
  elapsed,
  walkPhase,
}: {
  active: boolean
  elapsed: number
  walkPhase: WalkPhase
}) {
  const W = useWellnessColors()
  const step = useSharedValue(0)
  useEffect(() => {
    if (!active || walkPhase !== "walking") {
      cancelAnimation(step)
      step.value = 0
      return
    }
    step.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    return () => cancelAnimation(step)
  }, [active, walkPhase, step])
  const left = useAnimatedStyle(() => ({
    opacity: interpolate(step.value, [0, 1], [0.35, 1]),
    transform: [{ translateY: interpolate(step.value, [0, 1], [0, -6]) }],
  }))
  const right = useAnimatedStyle(() => ({
    opacity: interpolate(step.value, [0, 1], [1, 0.35]),
    transform: [{ translateY: interpolate(step.value, [0, 1], [-6, 0]) }],
  }))
  return (
    <View style={immersiveStyles.animWrap}>
      <View style={{ flexDirection: "row", gap: 48, alignItems: "flex-end" }}>
        <Animated.Text style={[{ fontSize: 64 }, left]}>👟</Animated.Text>
        <Animated.Text style={[{ fontSize: 64 }, right]}>👟</Animated.Text>
      </View>
      <Text style={{ marginTop: 12, color: W.text, fontSize: 16, fontWeight: "700" }}>
        {walkPhase === "walking" ? `${Math.floor(elapsed)}s` : "—"}
      </Text>
    </View>
  )
}

function WritingHandAnimation({ active }: { active: boolean }) {
  const W = useWellnessColors()
  const x = useSharedValue(0)
  useEffect(() => {
    if (!active) {
      cancelAnimation(x)
      x.value = 0
      return
    }
    x.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    )
    return () => cancelAnimation(x)
  }, [active, x])
  const pen = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(x.value, [0, 1], [-18, 22]) },
      { translateY: interpolate(x.value, [0, 1], [4, -8]) },
      { rotate: `${interpolate(x.value, [0, 1], [-8, 12])}deg` },
    ],
  }))
  return (
    <View style={immersiveStyles.animWrap}>
      <View style={{ width: 200, height: 120, justifyContent: "center",
        alignItems: "center",
      }}>
        <Ionicons name="document-text-outline" size={72} color={W.textMuted} />
        <Animated.View style={[pen, { position: "absolute", right: 24, bottom: 8 }]}>
          <Ionicons name="pencil" size={44} color={W.primary} />
        </Animated.View>
      </View>
    </View>
  )
}

const immersiveStyles = StyleSheet.create({
  animWrap: {
    position: "relative",
    width: ANIM_MAX,
    height: ANIM_MAX,
    alignItems: "center",
    justifyContent: "center",
  },
  sparkle: {
    position: "absolute",
    fontSize: 28,
  },
})

export type TaskRendererProps = {
  taskSlug: TaskSlug
  sessionActive: boolean
  voiceEnabled: boolean
  locale: WellnessLocale
  timeLeft: number
  elapsed: number
  walkPhase: WalkPhase
  timerMode: "countdown" | "manual"
}

export function TaskRenderer({
  taskSlug,
  sessionActive,
  voiceEnabled,
  locale,
  timeLeft: _timeLeft,
  elapsed,
  walkPhase,
  timerMode,
}: TaskRendererProps) {
  void _timeLeft
  void timerMode
  switch (taskSlug) {
    case "deep-breaths":
      return (
        <BreathingTaskVisual
          active={sessionActive}
          voiceEnabled={voiceEnabled}
          locale={locale}
        />
      )
    case "gratitude":
      return <GratitudeSparkle active={sessionActive} />
    case "stretch":
    case "upper-back":
    case "shoulder-release":
    case "posture":
      return <StretchArmsAnimation active={sessionActive} />
    case "walk":
      return (
        <WalkingFeetAnimation
          active={sessionActive}
          elapsed={elapsed}
          walkPhase={walkPhase}
        />
      )
    case "journal":
      return <WritingHandAnimation active={sessionActive} />
    default:
      return <GenericPulseCircle active={sessionActive} />
  }
}

/** Full-screen gradient + status bar (no scroll). */
export function ImmersiveTaskShell({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme()
  const gradient = useMemo(
    () =>
      scheme === "light"
        ? (["#F0F9FF", "#E0F2FE"] as const)
        : (["#151118", "#1f1c22"] as const),
    [scheme],
  )
  return (
    <LinearGradient colors={[...gradient]} style={{ flex: 1 }}>
      <StatusBar style={scheme === "light" ? "dark" : "light"} />
      {children}
    </LinearGradient>
  )
}

function withAlpha(hex: string, alphaPair: string): string {
  if (!hex.startsWith("#") || hex.length < 7) return `rgba(139, 92, 246, 0.35)`
  return `${hex.slice(0, 7)}${alphaPair}`
}
