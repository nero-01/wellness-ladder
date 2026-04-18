/** Mirrors web `lib/wellness-data.ts` for daily task catalog. */
export interface Task {
  id: number
  title: string
  instruction: string
  duration: number
  icon: string
}

export const WELLNESS_TASKS: Task[] = [
  { id: 1, title: "Take 3 Deep Breaths", instruction: "In... hold... out.", duration: 30, icon: "\u{1F32C}" },
  { id: 2, title: "Gratitude Moment", instruction: "Think of one thing you're grateful for today.", duration: 45, icon: "\u{1F64F}" },
  { id: 3, title: "Gentle Stretch", instruction: "Stretch your arms above your head and hold.", duration: 30, icon: "\u{1F9D8}" },
  { id: 4, title: "Mindful Walk", instruction: "Take 10 slow, mindful steps anywhere.", duration: 60, icon: "\u{1F6B6}" },
  { id: 5, title: "Quick Journal", instruction: "Mentally note one feeling you have right now.", duration: 30, icon: "\u{1F4DD}" },
  { id: 6, title: "Hydration Check", instruction: "Take a sip of water. Stay hydrated!", duration: 15, icon: "\u{1F4A7}" },
  { id: 7, title: "Reflect & Rest", instruction: "Close your eyes and breathe slowly.", duration: 45, icon: "\u{1F31F}" },
]

export function getTodayTask(streakDay: number): Task {
  const index = (streakDay - 1) % WELLNESS_TASKS.length
  return WELLNESS_TASKS[index]
}

/**
 * Task 1: three breaths across the full timer. Each breath is split into
 * in / hold / out so the last seconds show “Breathe out” (unlike a fixed 12s
 * modulo cycle on a 30s task, which ends on “Hold”).
 */
export function getBreathingPhaseLabel(
  taskId: number,
  duration: number,
  timeLeft: number,
): string | null {
  if (taskId !== 1 || duration <= 0) return null
  const elapsed = Math.max(0, duration - timeLeft)
  const breathCycle = Math.floor(duration / 3)
  if (breathCycle < 1) return null
  const phaseLen = breathCycle / 3
  const pos = elapsed % breathCycle
  if (pos < phaseLen) return "Breathe in..."
  if (pos < 2 * phaseLen) return "Hold..."
  return "Breathe out..."
}

export interface StreakData {
  currentStreak: number
  lastCompletedDate: string | null
  totalCompleted: number
  moodHistory: { date: string; mood: number }[]
  completionHistory: { date: string; taskId: number }[]
}

export const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  lastCompletedDate: null,
  totalCompleted: 0,
  moodHistory: [],
  completionHistory: [],
}
