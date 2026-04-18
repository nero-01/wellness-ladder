import { useEffect, useRef } from "react"
import type { WalkPhase } from "@/hooks/useTaskSessionTimer"
import { speakGuidanceLine, stopGuidancePlayback } from "@/lib/guidanceTts"
import type { WellnessLocale } from "@/lib/wellness-locale"
import type { Task } from "@/lib/wellness-data"
import { getSpeechLocaleCode } from "@/lib/za-afrikaans-tasks"

const VOICE_LINES = {
  en: {
    pace: "Keep your pace slow and gentle.",
    halfway: "You're doing well. Stay with it.",
  },
  af: {
    pace: "Hou jou pas stadig en sag.",
    halfway: "Jy doen goed. Bly by dit.",
  },
} as const

/**
 * Calming spoken guidance during tasks: **ElevenLabs** (via Next.js proxy) when
 * `EXPO_PUBLIC_USE_ELEVENLABS_TTS=true` and `EXPO_PUBLIC_API_URL` are set; otherwise **expo-speech**.
 * Afrikaans uses **expo-speech** with `af-ZA` (offline). Toggle with the speaker control.
 */
export function useTaskVoiceGuidance({
  enabled,
  task,
  timeLeft,
  duration,
  isActive,
  manualPhase,
  manualElapsed,
  locale,
}: {
  enabled: boolean
  task: Task
  timeLeft: number
  duration: number
  isActive: boolean
  /** Mindful Walk: walking / idle / stopped */
  manualPhase?: WalkPhase
  manualElapsed?: number
  locale: WellnessLocale
}) {
  const introDoneRef = useRef(false)
  const halfDoneRef = useRef(false)
  const manualIntroRef = useRef(false)
  const lastManualBucketRef = useRef(-1)

  const speechLang = getSpeechLocaleCode(locale)
  const lines = locale === "af" ? VOICE_LINES.af : VOICE_LINES.en

  useEffect(() => {
    introDoneRef.current = false
    halfDoneRef.current = false
    manualIntroRef.current = false
    lastManualBucketRef.current = -1
  }, [task.id])

  useEffect(() => {
    if (!enabled || !isActive) {
      stopGuidancePlayback()
    }
  }, [enabled, isActive])

  useEffect(
    () => () => {
      stopGuidancePlayback()
    },
    [],
  )

  // Manual walk: intro once when walking begins
  useEffect(() => {
    if (!enabled || task.timerMode !== "manual") return
    const phase = manualPhase ?? "idle"
    if (phase === "idle") {
      manualIntroRef.current = false
      return
    }
    if (phase !== "walking") return
    if (manualIntroRef.current) return
    manualIntroRef.current = true
    void speakGuidanceLine(`${task.title}. ${task.instruction}`, {
      language: speechLang,
    })
  }, [enabled, task, manualPhase, speechLang])

  // Manual walk: gentle nudges every 45s while walking
  useEffect(() => {
    if (!enabled || task.timerMode !== "manual") return
    const phase = manualPhase ?? "idle"
    const elapsed = manualElapsed ?? 0
    if (phase === "idle") {
      lastManualBucketRef.current = -1
      return
    }
    if (phase !== "walking") return
    const bucket = Math.floor(elapsed / 45)
    if (bucket === 0 || bucket === lastManualBucketRef.current) return
    lastManualBucketRef.current = bucket
    void speakGuidanceLine(lines.pace, { language: speechLang })
  }, [enabled, task, manualPhase, manualElapsed, lines.pace, speechLang])

  // Spoken intro once per run (countdown, non–breathing, non-manual)
  useEffect(() => {
    if (!enabled || !isActive) return
    if (task.id === 1) return
    if (task.timerMode === "manual") return
    if (introDoneRef.current) return
    introDoneRef.current = true
    void speakGuidanceLine(`${task.title}. ${task.instruction}`, {
      language: speechLang,
    })
  }, [
    enabled,
    isActive,
    task.id,
    task.title,
    task.instruction,
    task.timerMode,
    speechLang,
  ])

  // Breathing task (id 1): phase TTS is driven by `BreathingTaskVisual` + Reanimated cycle.

  // Longer countdown tasks: gentle halfway nudge
  useEffect(() => {
    if (!enabled || !isActive || task.id === 1) return
    if (task.timerMode === "manual") return
    if (duration < 20) return
    const elapsed = duration - timeLeft
    if (elapsed < duration / 2) return
    if (halfDoneRef.current) return
    halfDoneRef.current = true
    void speakGuidanceLine(lines.halfway, { language: speechLang })
  }, [
    enabled,
    isActive,
    task.id,
    task.timerMode,
    duration,
    timeLeft,
    lines.halfway,
    speechLang,
  ])
}
