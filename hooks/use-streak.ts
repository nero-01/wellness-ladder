"use client"

import { useState, useEffect, useCallback } from "react"
import { type StreakData, DEFAULT_STREAK_DATA } from "@/lib/wellness-data"

const STORAGE_KEY = "wellness-ladder-streak"

function getToday(): string {
  return new Date().toISOString().split("T")[0]
}

function isYesterday(dateStr: string): boolean {
  const date = new Date(dateStr)
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as StreakData
        
        // Check if streak is still valid (completed yesterday or today)
        if (parsed.lastCompletedDate) {
          if (!isToday(parsed.lastCompletedDate) && !isYesterday(parsed.lastCompletedDate)) {
            // Streak broken - reset but keep history
            setStreakData({
              ...parsed,
              currentStreak: 0
            })
          } else {
            setStreakData(parsed)
          }
        } else {
          setStreakData(parsed)
        }
      }
    } catch {
      // Invalid data, use defaults
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(streakData))
    }
  }, [streakData, isLoaded])

  const completeTask = useCallback((taskId: number, mood?: number) => {
    const today = getToday()
    
    setStreakData(prev => {
      // Don't double-count same day
      if (isToday(prev.lastCompletedDate)) {
        return prev
      }

      const newStreak = isYesterday(prev.lastCompletedDate || "") || prev.currentStreak === 0
        ? prev.currentStreak + 1
        : 1

      const newData: StreakData = {
        currentStreak: newStreak,
        lastCompletedDate: today,
        totalCompleted: prev.totalCompleted + 1,
        moodHistory: mood 
          ? [...prev.moodHistory, { date: today, mood }]
          : prev.moodHistory,
        completionHistory: [...prev.completionHistory, { date: today, taskId }]
      }

      return newData
    })
  }, [])

  const hasCompletedToday = isToday(streakData.lastCompletedDate)

  const getDisplayStreak = () => {
    if (hasCompletedToday) {
      return streakData.currentStreak
    }
    // If continuing a streak from yesterday, show next day number
    if (streakData.lastCompletedDate && isYesterday(streakData.lastCompletedDate)) {
      return streakData.currentStreak + 1
    }
    // Starting fresh
    return 1
  }

  return {
    streakData,
    isLoaded,
    completeTask,
    hasCompletedToday,
    displayStreak: getDisplayStreak()
  }
}
