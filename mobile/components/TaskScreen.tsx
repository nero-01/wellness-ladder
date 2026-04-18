import { LinearGradient } from "expo-linear-gradient"
import { useCallback, useEffect, useMemo, useState } from "react"
import { StyleSheet, Text, View } from "react-native"
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { speakGuidanceLine } from "@/lib/guidanceTts"
import { wellnessTapLight } from "@/lib/wellnessFeedback"
import type { WellnessLocale } from "@/lib/wellness-locale"
import {
  getSpeechLocaleCode,
  localizeBreathingPhase,
} from "@/lib/za-afrikaans-tasks"

/** Matches `WELLNESS_TASKS` id for “Take 3 Deep Breaths”. */
export const BREATHING_TASK_ID = 1 as const

type BreathPhaseKey = "Inhale" | "Hold" | "Exhale"

const INHALE_MS = 4000
const HOLD_MS = 4000
const EXHALE_MS = 6000

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

function secondsForPhase(phase: BreathPhaseKey): string {
  if (phase === "Inhale") return "4s"
  if (phase === "Hold") return "4s"
  return "6s"
}

type BreathingTaskVisualProps = {
  active: boolean
  voiceEnabled: boolean
  locale: WellnessLocale
}

/**
 * Breathing ring + phase copy for the “Take 3 Deep Breaths” task (task id 1).
 * Scale animates 0.6 → 1 → 0.6 with 4s inhale / 4s hold / 6s exhale; haptics + optional TTS on each transition.
 */
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
        wrap: { alignItems: "center", marginVertical: 16 },
        phase: {
          fontSize: 24,
          fontWeight: "600",
          textAlign: "center",
          marginTop: 8,
        },
        seconds: {
          fontSize: 40,
          fontWeight: "800",
          textAlign: "center",
          marginTop: 4,
        },
        hint: {
          fontSize: 17,
          textAlign: "center",
          marginTop: 16,
          marginBottom: 4,
          paddingHorizontal: 8,
          lineHeight: 22,
        },
        circleOuter: {
          width: 200,
          height: 200,
          alignSelf: "center",
          borderRadius: 100,
          overflow: "hidden",
          borderWidth: 3,
          borderColor: W.primary,
        },
        gradientFill: { flex: 1, borderRadius: 97 },
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

function withAlpha(hex: string, alphaPair: string): string {
  if (!hex.startsWith("#") || hex.length < 7) return `rgba(139, 92, 246, 0.35)`
  return `${hex.slice(0, 7)}${alphaPair}`
}

/** Re-export for task routes that import from `TaskScreen`. Prefer `speakTask` from `@/utils/elevenlabs`. */
export { speakTask } from "@/utils/elevenlabs"
