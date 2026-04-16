import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"

export const runtime = "nodejs"
export const maxDuration = 60

/**
 * Voice upload → transcription. Stub returns placeholder text unless OPENAI_API_KEY is set.
 * Production: send audio to OpenAI Whisper (whisper-1).
 */
export async function POST(request: Request) {
  try {
    await requireUser()

    const contentType = request.headers.get("content-type") ?? ""
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        { error: "Expected multipart/form-data with an audio field" },
        { status: 400 },
      )
    }

    const form = await request.formData()
    const file = form.get("audio") ?? form.get("file")
    if (!(file instanceof Blob) || file.size === 0) {
      return NextResponse.json({ error: "Missing audio blob" }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        text: "[stub] Connect OPENAI_API_KEY to enable Whisper transcription.",
        stub: true,
        bytesReceived: file.size,
      })
    }

    const fd = new FormData()
    fd.append("file", file, "audio.webm")
    fd.append("model", "whisper-1")

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: fd,
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error("Whisper error:", res.status, errText)
      return NextResponse.json({ error: "Transcription failed" }, { status: 502 })
    }

    const data = (await res.json()) as { text?: string }
    return NextResponse.json({
      text: data.text ?? "",
      stub: false,
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
