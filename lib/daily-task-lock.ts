/**
 * Strict 1/day completion: persisted alongside streak so tampering one key
 * still leaves the other enforcing the lock (localStorage / AsyncStorage).
 */

export const DAILY_LOCK_STORAGE_KEY = "wellness-daily-task-lock-v1" as const

export type DailyLockPayload = {
  v: 1
  date: string
  taskId: number
  mood?: number
}

export function parseDailyLock(raw: string | null): DailyLockPayload | null {
  if (!raw) return null
  try {
    const p = JSON.parse(raw) as DailyLockPayload
    if (p?.v !== 1 || typeof p.date !== "string" || typeof p.taskId !== "number") {
      return null
    }
    return p
  } catch {
    return null
  }
}

export function getTodayDateKey(): string {
  return new Date().toISOString().split("T")[0]
}

export function isDailyLockForToday(
  lock: DailyLockPayload | null,
  today: string = getTodayDateKey(),
): boolean {
  if (!lock) return false
  return lock.date === today
}

export function buildDailyLockPayload(
  taskId: number,
  mood?: number,
  date: string = getTodayDateKey(),
): DailyLockPayload {
  const base: DailyLockPayload = { v: 1, date, taskId }
  return mood !== undefined ? { ...base, mood } : base
}
