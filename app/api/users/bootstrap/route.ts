import { NextResponse } from "next/server"
import { requireUser } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

/**
 * Ensures a `users` row exists for the authenticated Supabase user.
 * Call after sign-in / sign-up (idempotent).
 */
export async function POST(request: Request) {
  try {
    const { user, id } = await requireUser(request)
    const email = user.email ?? null

    await prisma.user.upsert({
      where: { id },
      create: {
        id,
        email,
      },
      update: {
        email: email ?? undefined,
      },
    })

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
