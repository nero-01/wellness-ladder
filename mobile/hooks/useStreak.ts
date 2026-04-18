import AsyncStorage from "@react-native-async-storage/async-storage"
import { useCallback, useEffect, useState } from "react"
import {
  type StreakData,
  DEFAULT_STREAK_DATA,
} from "@/lib/wellness-data"

const STORAGE_KEY = "wellness-ladder-streak"

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

function isYesterday(dateStr: string): boolean {
  if (!dateStr?.trim()) return false
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return false
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return date.toISOString().split("T")[0] === yesterday.toISOString().split("T")[0]
}

function isToday(dateStr: string | null): boolean {
  if (!dateStr) return false
  return dateStr === getToday()
}

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK_DATA)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as StreakData
          if (parsed.lastCompletedDate) {
            if (
              !isToday(parsed.lastCompletedDate) &&
              !isYesterday(parsed.lastCompletedDate)
            ) {
              setStreakData({ ...parsed, currentStreak: 0 })
            } else {
              setStreakData(parsed)
            }
          } else {
            setStreakData(parsed)
          }
        }
      } catch {
        /* ignore */
      } finally {
        setIsLoaded(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(streakData))
  }, [streakData, isLoaded])

  const completeTask = useCallback((taskId: number, mood?: number) => {
    const today = getToday()
    setStreakData((prev) => {
      if (isToday(prev.lastCompletedDate)) {
        return prev
      }
      const newStreak =
        (prev.lastCompletedDate != null &&
          isYesterday(prev.lastCompletedDate)) ||
        prev.currentStreak === 0
          ? prev.currentStreak + 1
          : 1
      const newData: StreakData = {
        currentStreak: newStreak,
        lastCompletedDate: today,
        totalCompleted: prev.totalCompleted + 1,
        moodHistory: mood
          ? [...prev.moodHistory, { date: today, mood }]
          : prev.moodHistory,
        completionHistory: [...prev.completionHistory, { date: today, taskId }],
      }
      return newData
    })
  }, [])

  const hasCompletedToday = isToday(streakData.lastCompletedDate)

  const getDisplayStreak = (): number => {
    if (hasCompletedToday) {
      return streakData.currentStreak
    }
    if (
      streakData.lastCompletedDate &&
      isYesterday(streakData.lastCompletedDate)
    ) {
      return streakData.currentStreak + 1
    }
    return 1
  }

  return {
    streakData,
    isLoaded,
    completeTask,
    hasCompletedToday,
    displayStreak: getDisplayStreak(),
  }
}
