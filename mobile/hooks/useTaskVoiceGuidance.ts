import { Audio } from "expo-av"
import * as Speech from "expo-speech"
import { useEffect, useRef } from "react"
import { Platform } from "react-native"
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
}: {
  enabled: boolean
  task: Task
  timeLeft: number
  duration: number
  isActive: boolean
}) {
  const lastPhaseRef = useRef<string | null>(null)
  const introDoneRef = useRef(false)
  const halfDoneRef = useRef(false)

  useEffect(() => {
    lastPhaseRef.current = null
    introDoneRef.current = false
    halfDoneRef.current = false
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

  // Spoken intro once per run (non–breathing tasks only)
  useEffect(() => {
    if (!enabled || !isActive) return
    if (task.id === 1) return
    if (introDoneRef.current) return
    introDoneRef.current = true
    void ensurePlaybackAudioMode().then(() =>
      speakLine(`${task.title}. ${task.instruction}`),
    )
  }, [enabled, isActive, task.id, task.title, task.instruction])

  // Breathing task: cue each phase change
  useEffect(() => {
    if (!enabled || !isActive || task.id !== 1) return
    const phase = getBreathingPhaseLabel(task.id, duration, timeLeft)
    if (!phase) return
    if (phase === lastPhaseRef.current) return
    lastPhaseRef.current = phase
    void ensurePlaybackAudioMode().then(() => speakLine(phase))
  }, [enabled, isActive, task.id, duration, timeLeft])

  // Longer tasks: gentle halfway nudge
  useEffect(() => {
    if (!enabled || !isActive || task.id === 1) return
    if (duration < 20) return
    const elapsed = duration - timeLeft
    if (elapsed < duration / 2) return
    if (halfDoneRef.current) return
    halfDoneRef.current = true
    void ensurePlaybackAudioMode().then(() =>
      speakLine("You're doing well. Stay with it."),
    )
  }, [enabled, isActive, task.id, duration, timeLeft])
}
