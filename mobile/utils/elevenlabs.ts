import { Audio } from "expo-av"
import {
  cacheDirectory,
  deleteAsync,
  EncodingType,
  writeAsStringAsync,
} from "expo-file-system/legacy"
import * as Speech from "expo-speech"
import { Alert, Platform } from "react-native"
import { speakGuidanceLine, stopGuidancePlayback } from "@/lib/guidanceTts"

const CALM_SPEECH_BASE = {
  rate: Platform.select({ ios: 0.9, android: 0.95, default: 0.9 }) as number,
  pitch: 1,
}

const DEFAULT_VOICE_EN = "pNInz6obpgDQGcFmaJgB"
const DEFAULT_VOICE_AF = "EXpT5ixO6jI3N3b3pYv9"

function useElevenLabsProxy(): boolean {
  return (
    process.env.EXPO_PUBLIC_USE_ELEVENLABS_TTS === "true" &&
    !!(process.env.EXPO_PUBLIC_API_URL ?? "").trim()
  )
}

function hasDirectClientKey(): boolean {
  const k = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY?.trim()
  return Boolean(k && k.length >= 20)
}

function logKeyStatus(): void {
  if (!__DEV__) return
  const proxy = useElevenLabsProxy()
  const direct = hasDirectClientKey()
  console.log(
    `[elevenlabs] Key loaded: ${proxy || direct ? "✅" : "❌"} (proxy: ${proxy}, direct: ${direct})`,
  )
}

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

async function unloadDirectSound(): Promise<void> {
  if (!currentSound) return
  try {
    await currentSound.stopAsync()
    await currentSound.unloadAsync()
  } catch {
    /* ignore */
  }
  currentSound = null
}

/**
 * Speak a short task line. **Preferred:** Next.js proxy (`EXPO_PUBLIC_API_URL` + server `ELEVENLABS_API_KEY`)
 * via `speakGuidanceLine`. **Optional:** direct `api.elevenlabs.io` when `EXPO_PUBLIC_ELEVENLABS_API_KEY` is set
 * and no proxy is configured (exposes key in the client — dev / prototyping only).
 */
export async function speakTask(
  text: string,
  options: { lang?: "en" | "af"; voiceId?: string } = {},
): Promise<void> {
  const lang = options.lang ?? "en"
  const speechLang = lang === "af" ? "af-ZA" : "en-ZA"
  const line = text.replace(/\s+/g, " ").trim().slice(0, 300)
  if (!line) return

  logKeyStatus()

  if (useElevenLabsProxy()) {
    await speakGuidanceLine(line, { language: speechLang })
    return
  }

  const apiKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY?.trim()
  if (!apiKey || apiKey.length < 20) {
    if (__DEV__) {
      Alert.alert(
        "Voice setup",
        "Set EXPO_PUBLIC_API_URL to your deployed Next.js app (recommended), or add EXPO_PUBLIC_ELEVENLABS_API_KEY for direct API (dev only). Server key: ELEVENLABS_API_KEY in Next .env.",
      )
    }
    await ensurePlaybackAudioMode()
    speakFallback(line, speechLang)
    return
  }

  const voiceId =
    options.voiceId ||
    process.env.EXPO_PUBLIC_ELEVENLABS_VOICE_ID?.trim() ||
    (lang === "af" ? DEFAULT_VOICE_AF : DEFAULT_VOICE_EN)

  const modelId =
    lang === "af" ? "eleven_multilingual_v2" : "eleven_monolingual_v1"

  try {
    await stopGuidancePlayback()
    await unloadDirectSound()
    try {
      Speech.stop()
    } catch {
      /* ignore */
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
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
      return
    }

    const buf = await response.arrayBuffer()
    if (buf.byteLength === 0) {
      await ensurePlaybackAudioMode()
      speakFallback(line, speechLang)
      return
    }

    await ensurePlaybackAudioMode()

    const base64 = arrayBufferToBase64(buf)
    const dir = cacheDirectory
    if (!dir) {
      speakFallback(line, speechLang)
      return
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

    sound.setOnPlaybackStatusUpdate((st) => {
      if (st.isLoaded && st.didJustFinish) {
        void sound.unloadAsync()
        if (currentSound === sound) currentSound = null
        void deleteAsync(path, { idempotent: true }).catch(() => {})
      }
    })
  } catch (e) {
    console.warn("[elevenlabs] ElevenLabs failed:", e)
    await ensurePlaybackAudioMode()
    speakFallback(line, speechLang)
  }
}
