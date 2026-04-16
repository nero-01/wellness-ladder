import { NextResponse } from "next/server"
import { assertCronSecret } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import { getTodayTask, WELLNESS_TASKS } from "@/lib/wellness-data"

export const dynamic = "force-dynamic"

/**
 * Scheduled job: ensure each user has a row for today's default daily task (idempotent).
 * Configure your host (e.g. Vercel Cron) to GET this route with Authorization: Bearer CRON_SECRET.
 */
export async function GET(request: Request) {
  try {
    assertCronSecret(request)

    const today = new Date()
    today.setUTCHours(12, 0, 0, 0)

    const users = await prisma.user.findMany({ select: { id: true, streak: true } })

    let created = 0
    for (const u of users) {
      const streakDay = Math.max(1, u.streak || 1)
      const task = getTodayTask(streakDay)
      const dailyTaskId = task.id

      await prisma.userTask.upsert({
        where: {
          userId_dailyTaskId_forDate: {
            userId: u.id,
            dailyTaskId,
            forDate: today,
          },
        },
        create: {
          userId: u.id,
          dailyTaskId,
          forDate: today,
          completed: false,
        },
        update: {},
      })
      created++
    }

    return NextResponse.json({
      ok: true,
      date: today.toISOString().slice(0, 10),
      catalogSize: WELLNESS_TASKS.length,
      usersProcessed: created,
    })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 403 || err.status === 503) {
      return NextResponse.json({ error: err.message }, { status: err.status })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
