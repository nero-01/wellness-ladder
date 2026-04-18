import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "@/lib/api-auth"
import { computeNextStreak } from "@/lib/recurring-habit-streak"
import { prisma } from "@/lib/prisma"

const bodySchema = z.object({
  localDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await requireUser(request)
    const { id } = await ctx.params
    const json = await request.json()
    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const habit = await prisma.recurringHabit.findFirst({
      where: { id, userId },
    })
    if (!habit) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const repeatType = habit.repeatType as "daily" | "weekdays" | "custom"
    const repeatDays = habit.repeatDays as number[] | null

    const lastKey =
      habit.lastCompletedDate ?
        habit.lastCompletedDate.toISOString().slice(0, 10)
      : null

    const { streakCount, alreadyCompleted } = computeNextStreak({
      repeatType,
      repeatDays,
      previousStreak: habit.streakCount,
      lastCompletedDayKey: lastKey,
      completedDayKey: parsed.data.localDate,
    })

    if (alreadyCompleted) {
      return NextResponse.json({
        habit,
        alreadyCompleted: true,
      })
    }

    const completed = new Date(`${parsed.data.localDate}T12:00:00.000Z`)

    const updated = await prisma.recurringHabit.update({
      where: { id },
      data: {
        streakCount,
        lastCompletedDate: completed,
      },
    })

    return NextResponse.json({ habit: updated, alreadyCompleted: false })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
