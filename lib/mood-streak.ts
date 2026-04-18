import { format, parseISO, subDays } from "date-fns"

/**
 * Count consecutive calendar days ending at `endDate` that appear in `dates`.
 */
export function countConsecutiveDaysFrom(
  dates: Set<string>,
  endDate: string,
): number {
  let d = parseISO(`${endDate}T12:00:00`)
  let n = 0
  for (;;) {
    const key = format(d, "yyyy-MM-dd")
    if (!dates.has(key)) break
    n++
    d = subDays(d, 1)
  }
  return n
}

export function moodDatesSet(moodHistory: { date: string }[]): Set<string> {
  return new Set(moodHistory.map((m) => m.date))
}
