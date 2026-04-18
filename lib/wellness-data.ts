import type { Task } from "@/components/wellness/task-card"

export const WELLNESS_TASKS: Task[] = [
  {
    id: 1,
    title: "Take 3 Deep Breaths",
    instruction: "In... hold... out.",
    duration: 30,
    icon: String.fromCodePoint(0x1F32C) // wind
  },
  {
    id: 2,
    title: "Gratitude Moment",
    instruction: "Think of one thing you're grateful for today.",
    duration: 45,
    icon: String.fromCodePoint(0x1F64F) // folded hands
  },
  {
    id: 3,
    title: "Gentle Stretch",
    instruction: "Stretch your arms above your head and hold.",
    duration: 30,
    icon: String.fromCodePoint(0x1F9D8) // person in lotus
  },
  {
    id: 4,
    title: "Mindful Walk",
    instruction: "Take 10 slow, mindful steps anywhere.",
    duration: 60,
    icon: String.fromCodePoint(0x1F6B6) // walking
  },
  {
    id: 5,
    title: "Quick Journal",
    instruction: "Mentally note one feeling you have right now.",
    duration: 30,
    icon: String.fromCodePoint(0x1F4DD) // memo
  },
  {
    id: 6,
    title: "Hydration Check",
    instruction: "Take a sip of water. Stay hydrated!",
    duration: 15,
    icon: String.fromCodePoint(0x1F4A7) // droplet
  },
  {
    id: 7,
    title: "Reflect & Rest",
    instruction: "Close your eyes and breathe slowly.",
    duration: 45,
    icon: String.fromCodePoint(0x1F31F) // glowing star
  },
  {
    id: 8,
    title: "Shoulder Release",
    instruction: "Roll your shoulders up, back, and down—slowly, five times.",
    duration: 30,
    icon: String.fromCodePoint(0x1F4AA) // flexed biceps
  },
  {
    id: 9,
    title: "Screen Break",
    instruction: "Look away from any screen. Rest your eyes on something arm’s length or farther.",
    duration: 45,
    icon: String.fromCodePoint(0x1F4F4) // mobile phone off
  },
  {
    id: 10,
    title: "Gentle Self-Words",
    instruction: "Say one short kind sentence to yourself, out loud or in your head.",
    duration: 25,
    icon: String.fromCodePoint(0x2728) // sparkles
  },
  {
    id: 11,
    title: "Easy Neck Care",
    instruction: "Let your ear drift toward each shoulder—no forcing, small and slow.",
    duration: 35,
    icon: String.fromCodePoint(0x2195, 0xFE0F) // up-down arrow
  },
  {
    id: 12,
    title: "Green Glance",
    instruction: "Find something natural—a plant, tree, or sky—and notice one color or texture.",
    duration: 40,
    icon: String.fromCodePoint(0x1F331) // seedling
  },
  {
    id: 13,
    title: "Posture Reset",
    instruction: "Sit or stand tall, feet grounded, jaw unclenched, shoulders dropped.",
    duration: 30,
    icon: String.fromCodePoint(0x1F9CD) // standing person
  }
]

export function getTodayTask(streakDay: number): Task {
  const index = (streakDay - 1) % WELLNESS_TASKS.length
  return WELLNESS_TASKS[index]
}

/** Task 1: three breaths across the timer; in/hold/out per third of each breath. */
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
  completionHistory: []
}
