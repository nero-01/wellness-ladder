import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

const postSchema = z.object({
  mood: z.number().int().min(1).max(5),
  note: z.string().max(2000).optional(),
  loggedAt: z.string().datetime().optional(),
})

export async function GET(request: Request) {
  try {
    const { id } = await requireUser(request)
    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get("limit") ?? 30), 100)

    const logs = await prisma.moodLog.findMany({
      where: { userId: id },
      orderBy: { loggedAt: "desc" },
      take: limit,
    })

    return NextResponse.json({ moodLogs: logs })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { id } = await requireUser(request)
    const json = await request.json()
    const parsed = postSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const loggedAt = parsed.data.loggedAt ? new Date(parsed.data.loggedAt) : new Date()

    const log = await prisma.moodLog.create({
      data: {
        userId: id,
        mood: parsed.data.mood,
        note: parsed.data.note,
        loggedAt,
      },
    })

    return NextResponse.json(log, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
