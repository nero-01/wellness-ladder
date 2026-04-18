import type { RepeatType } from "@/lib/recurring-habit-streak"

export type RecurringHabit = {
  id: string
  userId?: string
  title: string
  description: string | null
  repeatType: RepeatType
  /** 0 = Sunday … 6 = Saturday (when `repeatType === "custom"`) */
  repeatDays: number[] | null
  reminderTime: string | null
  enabled: boolean
  streakCount: number
  /** Local calendar day `YYYY-MM-DD` */
  lastCompletedDate: string | null
  createdAt?: string
  updatedAt?: string
}

export const MAX_RECURRING_HABITS = 6

export const HABIT_TEMPLATES = [
  { title: "Drink water", description: "Take a mindful sip or refill your glass." },
  { title: "Screen break", description: "Look away, stretch your eyes, breathe once." },
  { title: "Stretch", description: "Gentle neck, shoulders, or standing stretch." },
  { title: "Short walk", description: "A few minutes of easy movement." },
] as const
