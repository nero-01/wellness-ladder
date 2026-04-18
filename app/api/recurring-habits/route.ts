import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "@/lib/api-auth"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

const MAX_HABITS = 6

const repeatTypeSchema = z.enum(["daily", "weekdays", "custom"])

const createSchema = z.object({
  title: z.string().trim().min(1).max(80),
  description: z.string().trim().max(240).optional().nullable(),
  repeatType: repeatTypeSchema,
  repeatDays: z.array(z.number().int().min(0).max(6)).optional().nullable(),
  reminderTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional()
    .nullable(),
  enabled: z.boolean().optional(),
})

function parseRepeatDays(
  repeatType: z.infer<typeof repeatTypeSchema>,
  repeatDays: number[] | null | undefined,
): number[] | null {
  if (repeatType !== "custom") return null
  if (!repeatDays || repeatDays.length === 0) return []
  return [...new Set(repeatDays)].sort((a, b) => a - b)
}

export async function GET(request: Request) {
  try {
    const { id } = await requireUser(request)
    const habits = await prisma.recurringHabit.findMany({
      where: { userId: id },
      orderBy: { id: "asc" },
    })
    return NextResponse.json({ habits })
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
    const parsed = createSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { repeatType, repeatDays: rawDays, ...rest } = parsed.data
    const repeatDays = parseRepeatDays(repeatType, rawDays ?? null)
    if (repeatType === "custom" && (!repeatDays || repeatDays.length === 0)) {
      return NextResponse.json(
        { error: "custom repeat requires at least one weekday" },
        { status: 400 },
      )
    }

    const count = await prisma.recurringHabit.count({ where: { userId: id } })
    if (count >= MAX_HABITS) {
      return NextResponse.json(
        { error: `Maximum ${MAX_HABITS} support habits` },
        { status: 400 },
      )
    }

    const habit = await prisma.recurringHabit.create({
      data: {
        userId: id,
        title: rest.title,
        description: rest.description ?? null,
        repeatType,
        repeatDays:
          repeatType === "custom" && repeatDays && repeatDays.length > 0 ?
            repeatDays
          : Prisma.DbNull,
        reminderTime: rest.reminderTime ?? null,
        enabled: rest.enabled ?? true,
      },
    })

    return NextResponse.json({ habit }, { status: 201 })
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
