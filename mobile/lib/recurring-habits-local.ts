import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  normalizeRecurringHabitRecord,
  normalizeUnknownToHabit,
} from "@/lib/recurring-habit-normalize"
import { computeNextStreak } from "@/lib/recurring-habit-streak"
import type { RecurringHabit } from "@/lib/recurring-habits-types"
import { MAX_RECURRING_HABITS } from "@/lib/recurring-habits-types"

const STORAGE_KEY = "wellness-recurring-habits-v1"

function uid(): string {
  return `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export async function loadLocalHabits(): Promise<RecurringHabit[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => normalizeUnknownToHabit(row))
      .filter((h): h is RecurringHabit => h != null)
  } catch {
    return []
  }
}

async function saveLocalHabits(habits: RecurringHabit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}

export async function createLocalHabit(
  input: Omit<RecurringHabit, "id" | "streakCount" | "lastCompletedDate">,
): Promise<RecurringHabit> {
  const habits = await loadLocalHabits()
  if (habits.length >= MAX_RECURRING_HABITS) {
    throw new Error(`Maximum ${MAX_RECURRING_HABITS} support habits`)
  }
  const newId = uid()
  const habit = normalizeRecurringHabitRecord({
    ...(input as unknown as Record<string, unknown>),
    id: newId,
    streakCount: 0,
    lastCompletedDate: null,
  })
  if (!habit) throw new Error("Could not create habit")
  habits.push(habit)
  await saveLocalHabits(habits)
  return habit
}

export async function updateLocalHabit(
  id: string,
  patch: Partial<RecurringHabit>,
): Promise<RecurringHabit | null> {
  const habits = await loadLocalHabits()
  const i = habits.findIndex((h) => h.id === id)
  if (i < 0) return null
  const merged = normalizeRecurringHabitRecord({
    ...(habits[i] as unknown as Record<string, unknown>),
    ...(patch as Record<string, unknown>),
  })
  habits[i] = merged ?? { ...habits[i], ...patch }
  await saveLocalHabits(habits)
  return habits[i]
}

export async function deleteLocalHabit(id: string): Promise<boolean> {
  const habits = await loadLocalHabits()
  const next = habits.filter((h) => h.id !== id)
  if (next.length === habits.length) return false
  await saveLocalHabits(next)
  return true
}

export async function completeLocalHabit(
  id: string,
  localDate: string,
): Promise<{ habit: RecurringHabit; alreadyCompleted: boolean } | null> {
  const habits = await loadLocalHabits()
  const i = habits.findIndex((h) => h.id === id)
  if (i < 0) return null
  const h = habits[i]
  const { streakCount, alreadyCompleted } = computeNextStreak({
    repeatType: h.repeatType,
    repeatDays: h.repeatDays,
    previousStreak: h.streakCount,
    lastCompletedDayKey: h.lastCompletedDate,
    completedDayKey: localDate,
  })
  if (alreadyCompleted) {
    return { habit: h, alreadyCompleted: true }
  }
  const updated = normalizeRecurringHabitRecord({
    ...(h as unknown as Record<string, unknown>),
    streakCount,
    lastCompletedDate: localDate,
  })
  habits[i] = updated ?? { ...h, streakCount, lastCompletedDate: localDate }
  await saveLocalHabits(habits)
  return { habit: habits[i], alreadyCompleted: false }
}
