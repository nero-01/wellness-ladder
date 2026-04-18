import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "@/lib/api-auth"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  title: z.string().trim().min(1).max(80).optional(),
  description: z.string().trim().max(240).optional().nullable(),
  repeatType: z.enum(["daily", "weekdays", "custom"]).optional(),
  repeatDays: z.array(z.number().int().min(0).max(6)).optional().nullable(),
  reminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  enabled: z.boolean().optional(),
})

function parseRepeatDays(
  repeatType: "daily" | "weekdays" | "custom",
  repeatDays: number[] | null | undefined,
): number[] | null {
  if (repeatType !== "custom") return null
  if (!repeatDays || repeatDays.length === 0) return []
  return [...new Set(repeatDays)].sort((a, b) => a - b)
}

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await requireUser(request)
    const { id } = await ctx.params
    const json = await request.json()
    const parsed = patchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const existing = await prisma.recurringHabit.findFirst({
      where: { id, userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const nextType = parsed.data.repeatType ?? existing.repeatType
    const mergedDays =
      parsed.data.repeatDays !== undefined ?
        parsed.data.repeatDays
      : (existing.repeatDays as number[] | null)

    const repeatDays = parseRepeatDays(
      nextType as "daily" | "weekdays" | "custom",
      mergedDays,
    )
    if (nextType === "custom" && (!repeatDays || repeatDays.length === 0)) {
      return NextResponse.json(
        { error: "custom repeat requires at least one weekday" },
        { status: 400 },
      )
    }

    const habit = await prisma.recurringHabit.update({
      where: { id },
      data: {
        ...(parsed.data.title !== undefined ? { title: parsed.data.title } : {}),
        ...(parsed.data.description !== undefined ?
          { description: parsed.data.description }
        : {}),
        ...(parsed.data.repeatType !== undefined ?
          { repeatType: parsed.data.repeatType }
        : {}),
        repeatDays:
          nextType === "custom" && repeatDays && repeatDays.length > 0 ?
            repeatDays
          : Prisma.DbNull,
        ...(parsed.data.reminderTime !== undefined ?
          { reminderTime: parsed.data.reminderTime }
        : {}),
        ...(parsed.data.enabled !== undefined ? { enabled: parsed.data.enabled } : {}),
      },
    })

    return NextResponse.json({ habit })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id: userId } = await requireUser(request)
    const { id } = await ctx.params

    const existing = await prisma.recurringHabit.findFirst({
      where: { id, userId },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    await prisma.recurringHabit.delete({ where: { id } })
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
