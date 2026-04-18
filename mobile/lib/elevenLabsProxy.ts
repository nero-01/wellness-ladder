import { apiFetch } from "@/lib/api"

/**
 * Fetches MP3 audio from your Next.js proxy (`POST /api/voice/elevenlabs`).
 * **Never** put `ELEVENLABS_API_KEY` or direct `api.elevenlabs.io` calls in Expo — keys stay on the server.
 *
 * Playback: use `expo-av` / `Audio.Sound` (see `guidanceTts.ts` → `speakGuidanceLine`).
 */
export async function fetchElevenLabsGuidanceMp3(text: string): Promise<Response> {
  const t = text.replace(/\s+/g, " ").trim()
  if (!t) {
    return new Response(null, { status: 400, statusText: "Empty text" })
  }
  return apiFetch("/api/voice/elevenlabs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: t }),
  })
}
