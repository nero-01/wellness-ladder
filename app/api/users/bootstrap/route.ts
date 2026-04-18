import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"
import { ensureUserProfile } from "@/lib/ensure-user-profile"

/**
 * Ensures a `users` row exists for the authenticated Supabase user.
 * Call after sign-in / sign-up (idempotent).
 */
export async function POST(request: Request) {
  try {
    const { user, id } = await requireUser(request)
    const email = user.email ?? null

    await ensureUserProfile(id, email)

    return NextResponse.json({ ok: true })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
