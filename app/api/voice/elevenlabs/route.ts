import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"

export const runtime = "nodejs"
export const maxDuration = 45

const DEFAULT_VOICE_ID = "pjcYQlDFKMbcOUp6F5GD"
const DEFAULT_MODEL = "eleven_multilingual_v2"

function devAuthBypass(): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ELEVENLABS_TTS_ALLOW_NO_AUTH_IN_DEV === "true"
  )
}

/** Debug: verify server has key and whether dev bypass is on (no secrets). */
export async function GET() {
  return NextResponse.json({
    hasApiKey: Boolean(process.env.ELEVENLABS_API_KEY?.trim()),
    devAuthBypass: devAuthBypass(),
    voiceId: process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID,
    modelId: process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL,
  })
}

/**
 * Proxies ElevenLabs text-to-speech so the API key stays on the server.
 * Mobile plays the returned MP3 with expo-av.
 *
 * Auth: requires a signed-in user (`Authorization: Bearer`) unless
 * `ELEVENLABS_TTS_ALLOW_NO_AUTH_IN_DEV=true` in **non-production** (local Next dev only).
 */
export async function POST(request: Request) {
  try {
    if (!devAuthBypass()) {
      await requireUser(request)
    }

    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey?.trim()) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY is not configured on the server" },
        { status: 503 },
      )
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Expected JSON body" }, { status: 400 })
    }

    const text =
      typeof body === "object" &&
      body !== null &&
      "text" in body &&
      typeof (body as { text: unknown }).text === "string"
        ? (body as { text: string }).text.trim()
        : ""

    if (!text) {
      return NextResponse.json({ error: "Missing non-empty `text`" }, { status: 400 })
    }
    if (text.length > 2_500) {
      return NextResponse.json({ error: "Text too long (max 2500 chars)" }, { status: 400 })
    }

    const voiceId =
      process.env.ELEVENLABS_VOICE_ID?.trim() || DEFAULT_VOICE_ID
    const modelId =
      process.env.ELEVENLABS_MODEL_ID?.trim() || DEFAULT_MODEL

    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: modelId,
          voice_settings: {
            stability: 0.52,
            similarity_boost: 0.78,
          },
        }),
      },
    )

    if (!upstream.ok) {
      const errText = await upstream.text()
      console.error("ElevenLabs TTS error:", upstream.status, errText)
      let detail = errText.slice(0, 400)
      try {
        const j = JSON.parse(errText) as { detail?: unknown }
        if (typeof j.detail === "string") detail = j.detail
        else if (j.detail && typeof j.detail === "object")
          detail = JSON.stringify(j.detail).slice(0, 400)
      } catch {
        /* use raw slice */
      }
      return NextResponse.json(
        {
          error: "elevenlabs_upstream",
          status: upstream.status,
          detail,
        },
        { status: 502 },
      )
    }

    const audio = await upstream.arrayBuffer()
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "private, max-age=0",
      },
    })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
