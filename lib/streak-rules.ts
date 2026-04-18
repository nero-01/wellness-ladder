import { differenceInCalendarDays, parseISO } from "date-fns"
import type { MoodMilestoneId, TaskMilestoneId } from "@/lib/wellness-data"

/** Max calendar days since last completion before chain breaks (exclusive of "today done"). */
export function maxGapCalendarDays(pro: boolean): number {
  return pro ? 3 : 1
}

export function daysSinceLastCompletion(
  lastCompletedDate: string | null,
  todayKey: string,
): number | null {
  if (!lastCompletedDate) return null
  return differenceInCalendarDays(parseISO(todayKey), parseISO(lastCompletedDate))
}

/** Chain still valid for continuing streak (not yet completed today). */
export function isStreakChainIntact(
  lastCompletedDate: string | null,
  todayKey: string,
  pro: boolean,
): boolean {
  if (!lastCompletedDate) return true
  const gap = daysSinceLastCompletion(lastCompletedDate, todayKey)
  if (gap === null) return true
  if (gap <= 0) return true
  return gap <= maxGapCalendarDays(pro)
}

export function isStreakChainBroken(
  lastCompletedDate: string | null,
  todayKey: string,
  pro: boolean,
): boolean {
  if (!lastCompletedDate) return false
  const gap = daysSinceLastCompletion(lastCompletedDate, todayKey)
  if (gap === null || gap <= 0) return false
  return gap > maxGapCalendarDays(pro)
}

export function milestoneForStreakLength(n: number): TaskMilestoneId | null {
  if (n === 2) return "bronze-2"
  if (n === 3) return "silver-3"
  if (n === 7) return "gold-7"
  return null
}

export function nextMilestoneFromUnlocked(
  unlocked: TaskMilestoneId[],
  streakAfter: number,
): TaskMilestoneId | null {
  const hit = milestoneForStreakLength(streakAfter)
  if (!hit || unlocked.includes(hit)) return null
  return hit
}

export const MILESTONE_NOTO: Record<
  TaskMilestoneId,
  { label: string; code: string }
> = {
  "bronze-2": { label: "Bronze spark", code: "1f31f" },
  "silver-3": { label: "Silver flame", code: "1f525" },
  "gold-7": { label: "Gold trophy", code: "1f3c6" },
}

export function moodMilestoneForLength(n: number): MoodMilestoneId | null {
  if (n === 3) return "mood-bronze-3"
  if (n === 7) return "mood-silver-7"
  if (n === 14) return "mood-gold-14"
  return null
}

export function nextMoodMilestoneFromUnlocked(
  unlocked: MoodMilestoneId[],
  moodStreakAfter: number,
): MoodMilestoneId | null {
  const hit = moodMilestoneForLength(moodStreakAfter)
  if (!hit || unlocked.includes(hit)) return null
  return hit
}

export const MOOD_MILESTONE_NOTO: Record<
  MoodMilestoneId,
  { label: string; code: string; sub: string }
> = {
  "mood-bronze-3": {
    label: "Bronze mood streak",
    code: "1f949",
    sub: "Three days of check-ins — steady care.",
  },
  "mood-silver-7": {
    label: "Silver mood streak",
    code: "1f948",
    sub: "A week of showing up for yourself.",
  },
  "mood-gold-14": {
    label: "Gold mood streak",
    code: "1f3c6",
    sub: "Two weeks of emotional check-ins — remarkable.",
  },
}
