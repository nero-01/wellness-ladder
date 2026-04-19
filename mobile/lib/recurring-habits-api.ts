import { apiFetch } from "@/lib/api"
import type { RepeatType } from "@/lib/recurring-habit-streak"
import type { RecurringHabit } from "@/lib/recurring-habits-types"

const REPEAT_TYPES = new Set<RepeatType>(["daily", "weekdays", "custom"])

function normalizeRepeatType(raw: unknown): RepeatType {
  return typeof raw === "string" && REPEAT_TYPES.has(raw as RepeatType) ?
      (raw as RepeatType)
    : "daily"
}

function normalizeRepeatDays(raw: unknown): number[] | null {
  if (!Array.isArray(raw)) return null
  const nums = raw
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
  if (nums.length === 0) return null
  return [...new Set(nums)].sort((a, b) => a - b)
}

function mapHabitFromApi(json: Record<string, unknown>): RecurringHabit | null {
  if (json.id == null) return null
  const id = String(json.id)
  const titleRaw = json.title != null ? String(json.title).trim() : ""
  const title = titleRaw.length > 0 ? titleRaw : "Support habit"

  let last: string | null = null
  if (json.lastCompletedDate) {
    const d = new Date(String(json.lastCompletedDate))
    last = Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
  }

  const streak = Number(json.streakCount ?? 0)
  return {
    id,
    userId: json.userId ? String(json.userId) : undefined,
    title,
    description: json.description != null ? String(json.description) : null,
    repeatType: normalizeRepeatType(json.repeatType),
    repeatDays: normalizeRepeatDays(json.repeatDays),
    reminderTime: json.reminderTime != null ? String(json.reminderTime) : null,
    enabled: Boolean(json.enabled ?? true),
    streakCount: Number.isFinite(streak) ? Math.max(0, streak) : 0,
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
  let parsed: unknown
  try {
    parsed = await res.json()
  } catch {
    throw new Error("Invalid response from server")
  }
  const raw =
    parsed &&
    typeof parsed === "object" &&
    "habits" in parsed &&
    Array.isArray((parsed as { habits: unknown }).habits) ?
      (parsed as { habits: Record<string, unknown>[] }).habits
    : []
  return raw.map((h) => mapHabitFromApi(h)).filter((h): h is RecurringHabit => h != null)
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
  let parsed: unknown
  try {
    parsed = await res.json()
  } catch {
    throw new Error("Invalid response from server")
  }
  const habit =
    parsed && typeof parsed === "object" && "habit" in parsed ?
      (parsed as { habit: Record<string, unknown> }).habit
    : null
  const mapped = habit ? mapHabitFromApi(habit) : null
  if (!mapped) throw new Error("Invalid habit payload")
  return mapped
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
  let parsed: unknown
  try {
    parsed = await res.json()
  } catch {
    throw new Error("Invalid response from server")
  }
  const habit =
    parsed && typeof parsed === "object" && "habit" in parsed ?
      (parsed as { habit: Record<string, unknown> }).habit
    : null
  const mapped = habit ? mapHabitFromApi(habit) : null
  if (!mapped) throw new Error("Invalid habit payload")
  return mapped
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
  let parsed: unknown
  try {
    parsed = await res.json()
  } catch {
    throw new Error("Invalid response from server")
  }
  const habit =
    parsed && typeof parsed === "object" && "habit" in parsed ?
      (parsed as { habit: Record<string, unknown> }).habit
    : null
  const mapped = habit ? mapHabitFromApi(habit) : null
  if (!mapped) throw new Error("Invalid habit payload")
  const alreadyCompleted =
    parsed && typeof parsed === "object" && "alreadyCompleted" in parsed ?
      Boolean((parsed as { alreadyCompleted?: unknown }).alreadyCompleted)
    : false
  return {
    habit: mapped,
    alreadyCompleted,
  }
}
