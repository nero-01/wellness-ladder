import { subDays } from "date-fns"

export type RepeatType = "daily" | "weekdays" | "custom"

export function matchesSchedule(
  day: Date,
  repeatType: RepeatType,
  repeatDays: number[] | null | undefined,
): boolean {
  const dow = day.getUTCDay()
  if (repeatType === "daily") return true
  if (repeatType === "weekdays") return dow >= 1 && dow <= 5
  if (repeatType === "custom" && repeatDays && repeatDays.length > 0) {
    return repeatDays.includes(dow)
  }
  return false
}

/**
 * Most recent scheduled calendar day strictly before `refDay` (UTC date parts).
 * Looks back up to 14 days.
 */
export function previousScheduledDay(
  refDay: Date,
  repeatType: RepeatType,
  repeatDays: number[] | null | undefined,
): Date | null {
  for (let i = 1; i <= 14; i++) {
    const d = subDays(refDay, i)
    if (matchesSchedule(d, repeatType, repeatDays)) {
      return new Date(
        Date.UTC(
          d.getUTCFullYear(),
          d.getUTCMonth(),
          d.getUTCDate(),
          12,
          0,
          0,
          0,
        ),
      )
    }
  }
  return null
}

function utcDayKey(d: Date): string {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

function parseDayKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d, 12, 0, 0, 0))
}

/**
 * Next streak after marking complete on `completedDayKey` (YYYY-MM-DD, UTC calendar).
 */
export function computeNextStreak(args: {
  repeatType: RepeatType
  repeatDays: number[] | null | undefined
  previousStreak: number
  lastCompletedDayKey: string | null
  completedDayKey: string
}): { streakCount: number; alreadyCompleted: boolean } {
  const { repeatType, repeatDays, previousStreak, lastCompletedDayKey, completedDayKey } =
    args

  if (lastCompletedDayKey === completedDayKey) {
    return { streakCount: previousStreak, alreadyCompleted: true }
  }

  const today = parseDayKey(completedDayKey)
  const expectedPrev = previousScheduledDay(today, repeatType, repeatDays)

  if (!lastCompletedDayKey) {
    return { streakCount: 1, alreadyCompleted: false }
  }

  if (!expectedPrev) {
    return { streakCount: 1, alreadyCompleted: false }
  }

  const expectedKey = utcDayKey(expectedPrev)
  if (lastCompletedDayKey === expectedKey) {
    return { streakCount: previousStreak + 1, alreadyCompleted: false }
  }

  return { streakCount: 1, alreadyCompleted: false }
}
