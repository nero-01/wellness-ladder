import AsyncStorage from "@react-native-async-storage/async-storage"
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
    const parsed = JSON.parse(raw) as RecurringHabit[]
    return Array.isArray(parsed) ? parsed : []
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
  const habit: RecurringHabit = {
    ...input,
    id: uid(),
    streakCount: 0,
    lastCompletedDate: null,
  }
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
  habits[i] = { ...habits[i], ...patch }
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
  habits[i] = {
    ...h,
    streakCount,
    lastCompletedDate: localDate,
  }
  await saveLocalHabits(habits)
  return { habit: habits[i], alreadyCompleted: false }
}
