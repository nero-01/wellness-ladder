import AsyncStorage from "@react-native-async-storage/async-storage"
import { format, parseISO, subDays } from "date-fns"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
import { syncStreakToRemote } from "@/lib/streak-sync"
import type { MilestoneId, StreakData } from "@/lib/wellness-data"
import { DEFAULT_STREAK_DATA } from "@/lib/wellness-data"
import { isWellnessPro } from "@/lib/wellness-pro"

const STORAGE_KEY = "wellness-ladder-streak"

function yesterdayDateKey(today: string): string {
  return format(subDays(parseISO(`${today}T12:00:00`), 1), "yyyy-MM-dd")
}

function isTodayKey(dateStr: string | null, today: string): boolean {
  if (!dateStr) return false
  return dateStr === today
}

function mergeStreak(raw: Partial<StreakData> | null): StreakData {
  const b = raw ?? {}
  const cs = b.currentStreak ?? 0
  return {
    ...DEFAULT_STREAK_DATA,
    ...b,
    maxStreak: b.maxStreak ?? cs,
    milestonesUnlocked: b.milestonesUnlocked ?? [],
    pendingRecovery: b.pendingRecovery ?? false,
  }
}

export function useStreak() {
  const [streakData, setStreakData] = useState<StreakData>(DEFAULT_STREAK_DATA)
  const [dailyLock, setDailyLock] = useState<DailyLockPayload | null>(null)
  const dailyLockRef = useRef<DailyLockPayload | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [milestoneHit, setMilestoneHit] = useState<MilestoneId | null>(null)

  useEffect(() => {
    dailyLockRef.current = dailyLock
  }, [dailyLock])

  useEffect(() => {
    void (async () => {
      try {
        const [stored, lockRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(DAILY_LOCK_STORAGE_KEY),
        ])

        const today = getTodayDateKey()
        const pro = isWellnessPro()

        const lock = parseDailyLock(lockRaw)
        if (lock && !isDailyLockForToday(lock, today)) {
          await AsyncStorage.removeItem(DAILY_LOCK_STORAGE_KEY)
          setDailyLock(null)
          dailyLockRef.current = null
        } else {
          setDailyLock(lock)
          dailyLockRef.current = lock
        }

        if (stored) {
          const parsed = mergeStreak(JSON.parse(stored) as Partial<StreakData>)

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
      } catch {
        /* ignore */
      } finally {
        setIsLoaded(true)
      }
    })()
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    void (async () => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(streakData))
      const today = getTodayDateKey()
      const entry = streakData.completionHistory.find((c) => c.date === today)
      if (entry) {
        const mood = streakData.moodHistory.find((m) => m.date === today)?.mood
        const payload = buildDailyLockPayload(entry.taskId, mood, today)
        await AsyncStorage.setItem(DAILY_LOCK_STORAGE_KEY, JSON.stringify(payload))
        setDailyLock(payload)
      } else if (!isTodayKey(streakData.lastCompletedDate, today)) {
        await AsyncStorage.removeItem(DAILY_LOCK_STORAGE_KEY)
        setDailyLock(null)
      }
    })()
  }, [streakData, isLoaded])

  const hasCompletedToday = useMemo(() => {
    const today = getTodayDateKey()
    return (
      isTodayKey(streakData.lastCompletedDate, today) ||
      isDailyLockForToday(dailyLock, today)
    )
  }, [streakData.lastCompletedDate, dailyLock])

  const acknowledgeMilestone = useCallback(() => {
    setMilestoneHit(null)
  }, [])

  const dismissRecovery = useCallback(() => {
    setStreakData((prev) => ({ ...prev, pendingRecovery: false }))
  }, [])

  const completeTask = useCallback((taskId: number, mood?: number) => {
    const today = getTodayDateKey()
    const pro = isWellnessPro()

    setStreakData((prev) => {
      if (isDailyLockForToday(dailyLockRef.current, today)) {
        return prev
      }
      if (isTodayKey(prev.lastCompletedDate, today)) {
        return prev
      }

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
        queueMicrotask(() => setMilestoneHit(hit))
      }

      const newData: StreakData = {
        ...prev,
        currentStreak: newStreak,
        maxStreak,
        lastCompletedDate: today,
        totalCompleted: prev.totalCompleted + 1,
        moodHistory:
          mood !== undefined
            ? [...prev.moodHistory, { date: today, mood }]
            : prev.moodHistory,
        completionHistory: [...prev.completionHistory, { date: today, taskId }],
        milestonesUnlocked,
        pendingRecovery: false,
      }

      const payload = buildDailyLockPayload(taskId, mood, today)
      void AsyncStorage.setItem(DAILY_LOCK_STORAGE_KEY, JSON.stringify(payload))
      dailyLockRef.current = payload
      setDailyLock(payload)

      void syncStreakToRemote({
        currentStreak: newData.currentStreak,
        totalCompleted: newData.totalCompleted,
        lastCompletedDate: newData.lastCompletedDate,
      })

      return newData
    })
  }, [])

  const streakCountForBadge = streakData.currentStreak

  const getDisplayStreak = (): number => {
    if (hasCompletedToday) {
      return streakData.currentStreak
    }
    const today = getTodayDateKey()
    const y = yesterdayDateKey(today)
    if (
      streakData.lastCompletedDate &&
      streakData.lastCompletedDate === y
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
    streakCountForBadge,
    milestoneHit,
    acknowledgeMilestone,
    pendingRecovery: streakData.pendingRecovery,
    dismissRecovery,
  }
}
