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
