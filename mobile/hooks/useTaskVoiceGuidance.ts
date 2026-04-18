import { Audio } from "expo-av"
import * as Speech from "expo-speech"
import { useEffect, useRef } from "react"
import { Platform } from "react-native"
import type { WalkPhase } from "@/hooks/useTaskSessionTimer"
import { getBreathingPhaseLabel, type Task } from "@/lib/wellness-data"

const CALM_SPEECH_OPTIONS = {
  rate: Platform.select({ ios: 0.9, android: 0.95, default: 0.9 }) as number,
  pitch: 1,
  language: "en-US",
}

function speakLine(text: string) {
  const line = text.replace(/\.\.\./g, "").replace(/\s+/g, " ").trim()
  if (!line) return
  try {
    Speech.stop()
    Speech.speak(line, CALM_SPEECH_OPTIONS)
  } catch {
    /* TTS unavailable on some platforms */
  }
}

async function ensurePlaybackAudioMode() {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    })
  } catch {
    /* ignore */
  }
}

/**
 * Calming spoken guidance while the task timer runs (expo-speech TTS).
 * Toggle with the speaker control; stops when the timer stops or guidance is off.
 */
export function useTaskVoiceGuidance({
  enabled,
  task,
  timeLeft,
  duration,
  isActive,
  manualPhase,
  manualElapsed,
}: {
  enabled: boolean
  task: Task
  timeLeft: number
  duration: number
  isActive: boolean
  /** Mindful Walk: walking / idle / stopped */
  manualPhase?: WalkPhase
  manualElapsed?: number
}) {
  const lastPhaseRef = useRef<string | null>(null)
  const introDoneRef = useRef(false)
  const halfDoneRef = useRef(false)
  const manualIntroRef = useRef(false)
  const lastManualBucketRef = useRef(-1)

  useEffect(() => {
    lastPhaseRef.current = null
    introDoneRef.current = false
    halfDoneRef.current = false
    manualIntroRef.current = false
    lastManualBucketRef.current = -1
  }, [task.id])

  useEffect(() => {
    if (!enabled || !isActive) {
      Speech.stop()
    }
  }, [enabled, isActive])

  useEffect(
    () => () => {
      Speech.stop()
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
    void ensurePlaybackAudioMode().then(() =>
      speakLine(`${task.title}. ${task.instruction}`),
    )
  }, [enabled, task, manualPhase])

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
    void ensurePlaybackAudioMode().then(() =>
      speakLine("Keep your pace slow and gentle."),
    )
  }, [enabled, task, manualPhase, manualElapsed])

  // Spoken intro once per run (countdown, non–breathing, non-manual)
  useEffect(() => {
    if (!enabled || !isActive) return
    if (task.id === 1) return
    if (task.timerMode === "manual") return
    if (introDoneRef.current) return
    introDoneRef.current = true
    void ensurePlaybackAudioMode().then(() =>
      speakLine(`${task.title}. ${task.instruction}`),
    )
  }, [enabled, isActive, task.id, task.title, task.instruction, task.timerMode])

  // Breathing task: cue each phase change
  useEffect(() => {
    if (!enabled || !isActive || task.id !== 1) return
    const phase = getBreathingPhaseLabel(task.id, duration, timeLeft)
    if (!phase) return
    if (phase === lastPhaseRef.current) return
    lastPhaseRef.current = phase
    void ensurePlaybackAudioMode().then(() => speakLine(phase))
  }, [enabled, isActive, task.id, duration, timeLeft])

  // Longer countdown tasks: gentle halfway nudge
  useEffect(() => {
    if (!enabled || !isActive || task.id === 1) return
    if (task.timerMode === "manual") return
    if (duration < 20) return
    const elapsed = duration - timeLeft
    if (elapsed < duration / 2) return
    if (halfDoneRef.current) return
    halfDoneRef.current = true
    void ensurePlaybackAudioMode().then(() =>
      speakLine("You're doing well. Stay with it."),
    )
  }, [enabled, isActive, task.id, task.timerMode, duration, timeLeft])
}
