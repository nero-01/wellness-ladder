import { isWellnessPro } from "@/lib/wellness-pro"

/** Simple Pro-only copy from recent mood check-ins (offline, no AI). */
export function proMoodInsightLine(moodHistory: { mood: number }[]): string | null {
  if (!isWellnessPro() || moodHistory.length < 2) return null
  const last = moodHistory[moodHistory.length - 1]!.mood
  const prev = moodHistory[moodHistory.length - 2]!.mood
  if (last > prev) return "Improving! Recent check-ins look brighter."
  if (last >= 4) return "Strong stretch — keep nurturing this energy."
  return "Thanks for staying consistent with your check-ins."
}
