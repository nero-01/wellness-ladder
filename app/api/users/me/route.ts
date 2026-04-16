import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  streak: z.number().int().min(0).optional(),
  lastCompletedDate: z.union([z.string().datetime(), z.null()]).optional(),
  totalCompleted: z.number().int().min(0).optional(),
})

export async function GET() {
  try {
    const { id } = await requireUser()
    const row = await prisma.user.findUnique({
      where: { id },
      include: {
        moodLogs: {
          orderBy: { loggedAt: "desc" },
          take: 60,
        },
        tasks: {
          orderBy: { forDate: "desc" },
          take: 90,
        },
      },
    })

    if (!row) {
      return NextResponse.json({ error: "Profile not found. Call POST /api/users/bootstrap first." }, { status: 404 })
    }

    return NextResponse.json(row)
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await requireUser()
    const json = await request.json()
    const parsed = patchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { streak, totalCompleted, lastCompletedDate } = parsed.data
    const row = await prisma.user.update({
      where: { id },
      data: {
        ...(streak !== undefined ? { streak } : {}),
        ...(totalCompleted !== undefined ? { totalCompleted } : {}),
        ...(lastCompletedDate !== undefined ?
          {
            lastCompletedDate:
              lastCompletedDate === null ? null : new Date(lastCompletedDate),
          }
        : {}),
      },
    })

    return NextResponse.json(row)
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
