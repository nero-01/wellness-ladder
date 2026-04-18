import { Audio } from "expo-av"
import {
  cacheDirectory,
  deleteAsync,
  EncodingType,
  writeAsStringAsync,
} from "expo-file-system/legacy"
import * as Speech from "expo-speech"
import { Platform } from "react-native"
import { apiFetch } from "@/lib/api"

/** Default wellness voice (ElevenLabs). Override server-side with ELEVENLABS_VOICE_ID. */
const CALM_SPEECH_OPTIONS = {
  rate: Platform.select({ ios: 0.9, android: 0.95, default: 0.9 }) as number,
  pitch: 1,
  language: "en-US",
}

let currentSound: Audio.Sound | null = null

function useElevenLabsProxy(): boolean {
  return (
    process.env.EXPO_PUBLIC_USE_ELEVENLABS_TTS === "true" &&
    !!(process.env.EXPO_PUBLIC_API_URL ?? "").trim()
  )
}

function logProxyDisabledReason(): void {
  if (!__DEV__) return
  if (process.env.EXPO_PUBLIC_USE_ELEVENLABS_TTS !== "true") {
    console.warn(
      "[guidance TTS] Set EXPO_PUBLIC_USE_ELEVENLABS_TTS=true (or NEXT_PUBLIC_ in root .env) and restart Expo with -c.",
    )
  } else if (!(process.env.EXPO_PUBLIC_API_URL ?? "").trim()) {
    console.warn(
      "[guidance TTS] Set EXPO_PUBLIC_API_URL to your Next.js URL (e.g. http://192.168.x.x:3000 for a physical device).",
    )
  }
}

function normalizeLine(text: string): string {
  return text.replace(/\.\.\./g, "").replace(/\s+/g, " ").trim()
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return globalThis.btoa(binary)
}

async function unloadCurrentSound(): Promise<void> {
  if (!currentSound) return
  try {
    await currentSound.stopAsync()
    await currentSound.unloadAsync()
  } catch {
    /* ignore */
  }
  currentSound = null
}

/** Stop device TTS and any ElevenLabs MP3 playback. */
export function stopGuidancePlayback(): void {
  try {
    Speech.stop()
  } catch {
    /* ignore */
  }
  void unloadCurrentSound()
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

function fallbackSpeech(line: string): void {
  try {
    Speech.speak(line, CALM_SPEECH_OPTIONS)
  } catch {
    /* TTS unavailable on some platforms */
  }
}

/**
 * Speak one guidance line: ElevenLabs via Next.js proxy when enabled, else expo-speech.
 */
export async function speakGuidanceLine(text: string): Promise<void> {
  const line = normalizeLine(text)
  if (!line) return

  await unloadCurrentSound()
  try {
    Speech.stop()
  } catch {
    /* ignore */
  }

  if (!useElevenLabsProxy()) {
    logProxyDisabledReason()
    await ensurePlaybackAudioMode()
    fallbackSpeech(line)
    return
  }

  try {
    const res = await apiFetch("/api/voice/elevenlabs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: line }),
    })

    if (!res.ok) {
      let errBody = await res.text().catch(() => "")
      try {
        const j = JSON.parse(errBody) as { error?: string; detail?: string }
        if (res.status === 401) {
          console.warn(
            "[guidance TTS] 401 Unauthorized — the proxy needs a Supabase session, or for local dev set ELEVENLABS_TTS_ALLOW_NO_AUTH_IN_DEV=true on the Next server (see README).",
          )
        } else {
          console.warn(
            "[guidance TTS] proxy error:",
            res.status,
            j.error ?? errBody,
            j.detail ?? "",
          )
        }
      } catch {
        console.warn("[guidance TTS] ElevenLabs proxy:", res.status, errBody)
      }
      await ensurePlaybackAudioMode()
      fallbackSpeech(line)
      return
    }

    const buf = await res.arrayBuffer()
    if (buf.byteLength === 0) {
      await ensurePlaybackAudioMode()
      fallbackSpeech(line)
      return
    }

    await ensurePlaybackAudioMode()

    const base64 = arrayBufferToBase64(buf)
    const dir = cacheDirectory
    if (!dir) {
      fallbackSpeech(line)
      return
    }

    const path = `${dir}wellness-guidance-${Date.now()}.mp3`
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
    console.warn("[guidance TTS]", e)
    await ensurePlaybackAudioMode()
    fallbackSpeech(line)
  }
}
