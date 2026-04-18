"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { type StreakData, DEFAULT_STREAK_DATA } from "@/lib/wellness-data"
import {
  DAILY_LOCK_STORAGE_KEY,
  buildDailyLockPayload,
  getTodayDateKey,
  isDailyLockForToday,
  parseDailyLock,
  type DailyLockPayload,
} from "@/lib/daily-task-lock"
import {
  isStreakChainBroken,
  isStreakChainIntact,
  nextMilestoneFromUnlocked,
} from "@/lib/streak-rules"
import { isWellnessPro } from "@/lib/wellness-pro"

const STORAGE_KEY = "wellness-ladder-streak"

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
  return dateStr === getTodayDateKey()
}

function mergeStreakData(raw: Partial<StreakData>): StreakData {
  const cs = raw.currentStreak ?? 0
  return {
    ...DEFAULT_STREAK_DATA,
    ...raw,
    maxStreak: raw.maxStreak ?? cs,
    milestonesUnlocked: raw.milestonesUnlocked ?? [],
    pendingRecovery: raw.pendingRecovery ?? false,
  }
}

function readDailyLockFromStorage(): DailyLockPayload | null {
  if (typeof window === "undefined") return null
  return parseDailyLock(localStorage.getItem(DAILY_LOCK_STORAGE_KEY))
}

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK_DATA)
  const [isLoaded, setIsLoaded] = useState(false)
  const [lockTick, setLockTick] = useState(0)

  // Load streak from localStorage; drop stale daily lock when calendar day changed
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const raw = JSON.parse(stored) as Partial<StreakData>
        const parsed = mergeStreakData(raw)
        const today = getTodayDateKey()
        const pro = isWellnessPro()

        if (
          parsed.lastCompletedDate &&
          isStreakChainBroken(parsed.lastCompletedDate, today, pro)
        ) {
          setStreakData({
            ...parsed,
            currentStreak: 0,
            maxStreak: Math.max(parsed.maxStreak, parsed.currentStreak),
            pendingRecovery: true,
          })
        } else {
          setStreakData(parsed)
        }
      }

      const rawLock = localStorage.getItem(DAILY_LOCK_STORAGE_KEY)
      const lock = parseDailyLock(rawLock)
      const today = getTodayDateKey()
      if (lock && !isDailyLockForToday(lock, today)) {
        localStorage.removeItem(DAILY_LOCK_STORAGE_KEY)
      }
    } catch {
      /* ignore */
    }
    setIsLoaded(true)
  }, [])

  // Persist streak + mirror strict daily lock when today appears in history
  useEffect(() => {
    if (!isLoaded) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(streakData))

    const today = getTodayDateKey()
    const entry = streakData.completionHistory.find((c) => c.date === today)
    if (entry) {
      const mood = streakData.moodHistory.find((m) => m.date === today)?.mood
      const payload = buildDailyLockPayload(entry.taskId, mood, today)
      localStorage.setItem(DAILY_LOCK_STORAGE_KEY, JSON.stringify(payload))
    } else if (!isToday(streakData.lastCompletedDate)) {
      localStorage.removeItem(DAILY_LOCK_STORAGE_KEY)
    }
  }, [streakData, isLoaded])

  // Other tabs: storage event updates strict lock read
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === DAILY_LOCK_STORAGE_KEY || e.key === STORAGE_KEY) {
        setLockTick((n) => n + 1)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const dailyLock = useMemo(
    () => readDailyLockFromStorage(),
    [streakData, lockTick],
  )

  const hasCompletedToday = useMemo(() => {
    const today = getTodayDateKey()
    return (
      isToday(streakData.lastCompletedDate) || isDailyLockForToday(dailyLock, today)
    )
  }, [streakData.lastCompletedDate, dailyLock])

  const completeTask = useCallback((taskId: number, mood?: number) => {
    const today = getTodayDateKey()

    setStreakData((prev) => {
      const lock = readDailyLockFromStorage()
      if (isDailyLockForToday(lock, today)) {
        return prev
      }
      if (isToday(prev.lastCompletedDate)) {
        return prev
      }

      const pro = isWellnessPro()
      let newStreak: number
      if (prev.lastCompletedDate == null) {
        newStreak = 1
      } else if (!isStreakChainIntact(prev.lastCompletedDate, today, pro)) {
        newStreak = 1
      } else {
        newStreak = prev.currentStreak + 1
      }

      const maxStreak = Math.max(prev.maxStreak, newStreak)
      let milestonesUnlocked = [...prev.milestonesUnlocked]
      const hit = nextMilestoneFromUnlocked(milestonesUnlocked, newStreak)
      if (hit) {
        milestonesUnlocked = [...milestonesUnlocked, hit]
      }

      const newData: StreakData = {
        ...prev,
        currentStreak: newStreak,
        maxStreak,
        lastCompletedDate: today,
        totalCompleted: prev.totalCompleted + 1,
        moodHistory:
          mood !== undefined ? [...prev.moodHistory, { date: today, mood }] : prev.moodHistory,
        completionHistory: [...prev.completionHistory, { date: today, taskId }],
        milestonesUnlocked,
        pendingRecovery: false,
      }

      localStorage.setItem(DAILY_LOCK_STORAGE_KEY, JSON.stringify(buildDailyLockPayload(taskId, mood, today)))
      setLockTick((n) => n + 1)

      return newData
    })
  }, [])

  const getDisplayStreak = () => {
    if (hasCompletedToday) {
      return streakData.currentStreak
    }
    if (streakData.lastCompletedDate && isYesterday(streakData.lastCompletedDate)) {
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
