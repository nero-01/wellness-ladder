import type { RepeatType } from "@/lib/recurring-habit-streak"
import type { RecurringHabit } from "@/lib/recurring-habits-types"

const REPEAT_TYPES = new Set<RepeatType>(["daily", "weekdays", "custom"])

/** Safe repeat type for forms and scheduling — never undefined. */
export function coerceRepeatType(raw: unknown): RepeatType {
  return typeof raw === "string" && REPEAT_TYPES.has(raw as RepeatType) ?
      (raw as RepeatType)
    : "daily"
}

function normalizeRepeatDays(raw: unknown): number[] | null {
  if (raw == null) return null
  let v: unknown = raw
  if (typeof v === "string") {
    try {
      v = JSON.parse(v) as unknown
    } catch {
      return null
    }
  }
  if (!Array.isArray(v)) return null
  const nums = v
    .map((x) => Number(x))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
  if (nums.length === 0) return null
  return [...new Set(nums)].sort((a, b) => a - b)
}

/**
 * Maps API, AsyncStorage, or partial objects into a consistent {@link RecurringHabit}.
 * Returns null only when `id` is missing.
 */
export function normalizeRecurringHabitRecord(
  json: Record<string, unknown>,
): RecurringHabit | null {
  if (json.id == null) return null
  const id = String(json.id).trim()
  if (!id) return null

  const titleRaw = json.title != null ? String(json.title).trim() : ""
  const title = titleRaw.length > 0 ? titleRaw : "Support habit"

  let last: string | null = null
  if (json.lastCompletedDate != null && json.lastCompletedDate !== "") {
    const d = new Date(String(json.lastCompletedDate))
    last = Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10)
  }

  const streak = Number(json.streakCount ?? 0)
  return {
    id,
    userId: json.userId != null ? String(json.userId) : undefined,
    title,
    description: json.description != null ? String(json.description) : null,
    repeatType: coerceRepeatType(json.repeatType),
    repeatDays: normalizeRepeatDays(json.repeatDays),
    reminderTime:
      json.reminderTime != null && String(json.reminderTime).trim() !== "" ?
        String(json.reminderTime).trim()
      : null,
    enabled: Boolean(json.enabled ?? true),
    streakCount: Number.isFinite(streak) ? Math.max(0, Math.floor(streak)) : 0,
    lastCompletedDate: last,
    createdAt: json.createdAt != null ? String(json.createdAt) : undefined,
    updatedAt: json.updatedAt != null ? String(json.updatedAt) : undefined,
  }
}

export function normalizeUnknownToHabit(input: unknown): RecurringHabit | null {
  if (!input || typeof input !== "object") return null
  return normalizeRecurringHabitRecord(input as Record<string, unknown>)
}

/** Drop invalid rows; de-dupe by id (last wins). */
export function sanitizeRecurringHabitsList(
  list: unknown,
): RecurringHabit[] {
  if (!Array.isArray(list)) return []
  const byId = new Map<string, RecurringHabit>()
  for (const item of list) {
    const h = normalizeUnknownToHabit(item)
    if (h) byId.set(h.id, h)
  }
  return [...byId.values()]
}
