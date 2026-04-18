import { Audio } from "expo-av"
import {
  cacheDirectory,
  deleteAsync,
  EncodingType,
  writeAsStringAsync,
} from "expo-file-system/legacy"
import * as Speech from "expo-speech"
import { Platform } from "react-native"

const CALM_SPEECH_BASE = {
  rate: Platform.select({ ios: 0.9, android: 0.95, default: 0.9 }) as number,
  pitch: 1,
}

const DEFAULT_VOICE_EN = "pNInz6obpgDQGcFmaJgB"
const DEFAULT_VOICE_AF = "EXpT5ixO6jI3N3b3pYv9"

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return globalThis.btoa(binary)
}

async function ensurePlaybackAudioMode(): Promise<void> {
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

function speakFallback(text: string, language: string): void {
  try {
    Speech.stop()
  } catch {
    /* ignore */
  }
  try {
    Speech.speak(text, { ...CALM_SPEECH_BASE, language })
  } catch {
    /* ignore */
  }
}

let currentSound: Audio.Sound | null = null
let currentPath: string | null = null

async function unloadCurrentSound(): Promise<void> {
  if (!currentSound) return
  try {
    await currentSound.stopAsync()
    await currentSound.unloadAsync()
  } catch {
    /* ignore */
  }
  currentSound = null
  if (currentPath) {
    await deleteAsync(currentPath, { idempotent: true }).catch(() => {})
    currentPath = null
  }
}

/**
 * Speak task guidance via ElevenLabs direct API.
 * Falls back to expo-speech if API fails.
 */
export async function speakTask(
  text: string,
  lang: "en" | "af" = "en",
  voiceId?: string,
): Promise<{ ok: boolean; source: "elevenlabs" | "fallback" }> {
  const speechLang = lang === "af" ? "af-ZA" : "en-ZA"
  const line = text.replace(/\s+/g, " ").trim().slice(0, 300)
  if (!line) return { ok: false, source: "fallback" }

  const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY?.trim()
  if (!apiKey || apiKey.length < 20) {
    console.warn("[elevenlabs] Missing EXPO_PUBLIC_ELEVENLABS_API_KEY; falling back")
    await ensurePlaybackAudioMode()
    speakFallback(line, speechLang)
    return { ok: false, source: "fallback" }
  }

  const resolvedVoiceId =
    voiceId ||
    process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID?.trim() ||
    (lang === "af" ? DEFAULT_VOICE_AF : DEFAULT_VOICE_EN)

  const modelId =
    lang === "af" ? "eleven_multilingual_v2" : "eleven_monolingual_v1"

  try {
    await unloadCurrentSound()
    try { Speech.stop() } catch { /* ignore */ }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: line,
          model_id: modelId,
          voice_settings: { stability: 0.5 },
        }),
      },
    )

    if (!response.ok) {
      console.warn(
        "[elevenlabs] direct API:",
        response.status,
        await response.text().catch(() => ""),
      )
      await ensurePlaybackAudioMode()
      speakFallback(line, speechLang)
      return { ok: false, source: "fallback" }
    }

    const buf = await response.arrayBuffer()
    if (buf.byteLength === 0) {
      await ensurePlaybackAudioMode()
      speakFallback(line, speechLang)
      return { ok: false, source: "fallback" }
    }

    await ensurePlaybackAudioMode()

    const base64 = arrayBufferToBase64(buf)
    const dir = cacheDirectory
    if (!dir) {
      speakFallback(line, speechLang)
      return { ok: false, source: "fallback" }
    }

    const path = `${dir}wellness-task-${Date.now()}.mp3`
    await writeAsStringAsync(path, base64, {
      encoding: EncodingType.Base64,
    })

    const { sound } = await Audio.Sound.createAsync(
      { uri: path },
      { shouldPlay: true, volume: 1 },
    )
    currentSound = sound
    currentPath = path

    await new Promise<void>((resolve) => {
      sound.setOnPlaybackStatusUpdate((st) => {
        if (!st.isLoaded) return
        if (st.didJustFinish || st.isBuffering === false && !st.isPlaying && st.positionMillis > 0) {
          resolve()
        }
      })
    })
    await unloadCurrentSound()
    return { ok: true, source: "elevenlabs" }
  } catch (e) {
    console.warn("[elevenlabs] ElevenLabs failed:", e)
    await ensurePlaybackAudioMode()
    speakFallback(line, speechLang)
    return { ok: false, source: "fallback" }
  }
}

export async function stopTaskSpeech(): Promise<void> {
  try {
    Speech.stop()
  } catch {
    /* ignore */
  }
  await unloadCurrentSound()
}
