import { apiFetch } from "@/lib/api"
import { normalizeRecurringHabitRecord } from "@/lib/recurring-habit-normalize"
import type { RepeatType } from "@/lib/recurring-habit-streak"
import type { RecurringHabit } from "@/lib/recurring-habits-types"

function mapHabitFromApi(json: Record<string, unknown>): RecurringHabit | null {
  return normalizeRecurringHabitRecord(json)
}

function friendlyHabitHttpError(status: number, body: string): string {
  if (status === 401) {
    return "Sign in again to load support habits."
  }
  if (status === 404) {
    return "Support habits are unavailable on this server."
  }
  const trimmed = body.trim()
  if (trimmed.length > 0 && trimmed.length < 200 && !trimmed.startsWith("<")) {
    return trimmed
  }
  return `Could not load habits (${status}).`
}

export async function fetchRecurringHabits(): Promise<RecurringHabit[]> {
  const res = await apiFetch("/api/recurring-habits")
  if (!res.ok) {
    const t = await res.text()
    throw new Error(friendlyHabitHttpError(res.status, t))
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
