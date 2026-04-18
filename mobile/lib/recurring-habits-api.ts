import { apiFetch } from "@/lib/api"
import type { RepeatType } from "@/lib/recurring-habit-streak"
import type { RecurringHabit } from "@/lib/recurring-habits-types"

function mapHabitFromApi(json: Record<string, unknown>): RecurringHabit {
  let last: string | null = null
  if (json.lastCompletedDate) {
    const d = new Date(String(json.lastCompletedDate))
    last = Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
  }
  const days = json.repeatDays
  return {
    id: String(json.id),
    userId: json.userId ? String(json.userId) : undefined,
    title: String(json.title),
    description: json.description != null ? String(json.description) : null,
    repeatType: json.repeatType as RepeatType,
    repeatDays: Array.isArray(days) ? (days as number[]) : null,
    reminderTime: json.reminderTime != null ? String(json.reminderTime) : null,
    enabled: Boolean(json.enabled ?? true),
    streakCount: Number(json.streakCount ?? 0),
    lastCompletedDate: last,
    createdAt: json.createdAt ? String(json.createdAt) : undefined,
    updatedAt: json.updatedAt ? String(json.updatedAt) : undefined,
  }
}

export async function fetchRecurringHabits(): Promise<RecurringHabit[]> {
  const res = await apiFetch("/api/recurring-habits")
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Failed to load habits (${res.status})`)
  }
  const data = (await res.json()) as { habits: Record<string, unknown>[] }
  return (data.habits ?? []).map((h) => mapHabitFromApi(h))
}

export async function createRemoteHabit(body: {
  title: string
  description?: string | null
  repeatType: RepeatType
  repeatDays?: number[] | null
  reminderTime?: string | null
  enabled?: boolean
}): Promise<RecurringHabit> {
  const res = await apiFetch("/api/recurring-habits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Create failed (${res.status})`)
  }
  const data = (await res.json()) as { habit: Record<string, unknown> }
  return mapHabitFromApi(data.habit)
}

export async function patchRemoteHabit(
  id: string,
  patch: Partial<{
    title: string
    description: string | null
    repeatType: RepeatType
    repeatDays: number[] | null
    reminderTime: string | null
    enabled: boolean
  }>,
): Promise<RecurringHabit> {
  const res = await apiFetch(`/api/recurring-habits/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Update failed (${res.status})`)
  }
  const data = (await res.json()) as { habit: Record<string, unknown> }
  return mapHabitFromApi(data.habit)
}

export async function deleteRemoteHabit(id: string): Promise<void> {
  const res = await apiFetch(`/api/recurring-habits/${id}`, { method: "DELETE" })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Delete failed (${res.status})`)
  }
}

export async function completeRemoteHabit(
  id: string,
  localDate: string,
): Promise<{ habit: RecurringHabit; alreadyCompleted: boolean }> {
  const res = await apiFetch(`/api/recurring-habits/${id}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ localDate }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Complete failed (${res.status})`)
  }
  const data = (await res.json()) as {
    habit: Record<string, unknown>
    alreadyCompleted: boolean
  }
  return {
    habit: mapHabitFromApi(data.habit),
    alreadyCompleted: Boolean(data.alreadyCompleted),
  }
}
