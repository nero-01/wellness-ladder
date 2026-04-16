import { NextResponse } from "next/server"
import { z } from "zod"
import { requireUser } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"

const patchSchema = z.object({
  id: z.string().min(1),
  completed: z.boolean(),
})

export async function GET(request: Request) {
  try {
    const { id } = await requireUser(request)
    const { searchParams } = new URL(request.url)
    const forDate = searchParams.get("forDate")
    const where =
      forDate ?
        {
          userId: id as string,
          forDate: new Date(forDate),
        }
      : { userId: id }

    const tasks = await prisma.userTask.findMany({
      where,
      orderBy: { forDate: "desc" },
    })

    return NextResponse.json({ tasks })
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
    const schema = z.object({
      dailyTaskId: z.number().int().min(1),
      forDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      completed: z.boolean().optional(),
    })
    const json = await request.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const forDate = new Date(parsed.data.forDate + "T12:00:00.000Z")

    const task = await prisma.userTask.upsert({
      where: {
        userId_dailyTaskId_forDate: {
          userId: id,
          dailyTaskId: parsed.data.dailyTaskId,
          forDate,
        },
      },
      create: {
        userId: id,
        dailyTaskId: parsed.data.dailyTaskId,
        forDate,
        completed: parsed.data.completed ?? false,
        completedAt: parsed.data.completed ? new Date() : null,
      },
      update: {
        completed: parsed.data.completed ?? false,
        completedAt: parsed.data.completed ? new Date() : null,
      },
    })

    return NextResponse.json(task, { status: 201 })
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
    const { id } = await requireUser(request)
    const json = await request.json()
    const parsed = patchSchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const existing = await prisma.userTask.findFirst({
      where: { id: parsed.data.id, userId: id },
    })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const task = await prisma.userTask.update({
      where: { id: parsed.data.id },
      data: {
        completed: parsed.data.completed,
        completedAt: parsed.data.completed ? new Date() : null,
      },
    })

    return NextResponse.json(task)
  } catch (e) {
    const err = e as Error & { status?: number }
    if (err.status === 401) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.error(e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
