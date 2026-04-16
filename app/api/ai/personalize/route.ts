import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Proxies to Supabase Edge Function `personalize` with the caller JWT.
 * Deploy function: `supabase functions deploy personalize`
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const base = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!base) {
      return NextResponse.json({ error: "Supabase URL not configured" }, { status: 503 })
    }

    const body = await request.text()
    const res = await fetch(`${base.replace(/\/$/, "")}/functions/v1/personalize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: body || "{}",
    })

    const text = await res.text()
    let json: unknown
    try {
      json = JSON.parse(text)
    } catch {
      json = { raw: text }
    }

    return NextResponse.json(json, { status: res.status })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
