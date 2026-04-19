import { format } from "date-fns"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  completeRemoteHabit,
  createRemoteHabit,
  deleteRemoteHabit,
  fetchRecurringHabits,
  patchRemoteHabit,
} from "@/lib/recurring-habits-api"
import {
  completeLocalHabit,
  createLocalHabit,
  deleteLocalHabit,
  loadLocalHabits,
  updateLocalHabit,
} from "@/lib/recurring-habits-local"
import {
  cancelHabitNotifications,
  rescheduleAllHabitNotifications,
  rescheduleHabitNotifications,
} from "@/lib/recurring-habit-notifications"
import type { RepeatType } from "@/lib/recurring-habit-streak"
import type { RecurringHabit } from "@/lib/recurring-habits-types"
import { isSupabaseConfigured } from "@/lib/supabase"

function getApiBase(): string {
  return (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "")
}

function useLocalPersistence(): boolean {
  return (
    process.env.EXPO_PUBLIC_USE_MOCK_AUTH === "true" ||
    !isSupabaseConfigured() ||
    !getApiBase()
  )
}

export function useRecurringHabits() {
  const localOnly = useLocalPersistence()
  const [habits, setHabits] = useState<RecurringHabit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    let list: RecurringHabit[] = []
    try {
      list = localOnly ? await loadLocalHabits() : await fetchRecurringHabits()
      setHabits(list)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load habits")
      setHabits([])
    } finally {
      setLoading(false)
    }
    try {
      await rescheduleAllHabitNotifications(list)
    } catch (e) {
      if (__DEV__) {
        console.warn("[wellness] habit notification reschedule failed", e)
      }
    }
  }, [localOnly])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const create = useCallback(
    async (input: {
      title: string
      description?: string | null
      repeatType: RepeatType
      repeatDays?: number[] | null
      reminderTime?: string | null
      enabled?: boolean
    }) => {
      const repeatDays =
        input.repeatType === "custom" ? input.repeatDays ?? null : null
      if (localOnly) {
        const h = await createLocalHabit({
          title: input.title,
          description: input.description ?? null,
          repeatType: input.repeatType,
          repeatDays,
          reminderTime: input.reminderTime ?? null,
          enabled: input.enabled ?? true,
        })
        setHabits((prev) => [...prev, h])
        try {
          await rescheduleHabitNotifications(h)
        } catch (e) {
          if (__DEV__) console.warn("[wellness] reschedule after create (local)", e)
        }
        return h
      }
      const h = await createRemoteHabit({
        ...input,
        repeatDays,
      })
      setHabits((prev) => [...prev, h])
      try {
        await rescheduleHabitNotifications(h)
      } catch (e) {
        if (__DEV__) console.warn("[wellness] reschedule after create (remote)", e)
      }
      return h
    },
    [localOnly],
  )

  const update = useCallback(
    async (id: string, patch: Partial<RecurringHabit>) => {
      if (localOnly) {
        const h = await updateLocalHabit(id, patch)
        if (!h) return
        setHabits((prev) => prev.map((x) => (x.id === id ? h : x)))
        try {
          await rescheduleHabitNotifications(h)
        } catch (e) {
          if (__DEV__) console.warn("[wellness] reschedule after update (local)", e)
        }
        return h
      }
      const body: Parameters<typeof patchRemoteHabit>[1] = {}
      if (patch.title !== undefined) body.title = patch.title
      if (patch.description !== undefined) body.description = patch.description
      if (patch.repeatType !== undefined) body.repeatType = patch.repeatType
      if (patch.repeatDays !== undefined) body.repeatDays = patch.repeatDays
      if (patch.reminderTime !== undefined) body.reminderTime = patch.reminderTime
      if (patch.enabled !== undefined) body.enabled = patch.enabled
      const h = await patchRemoteHabit(id, body)
      setHabits((prev) => prev.map((x) => (x.id === id ? h : x)))
      try {
        await rescheduleHabitNotifications(h)
      } catch (e) {
        if (__DEV__) console.warn("[wellness] reschedule after update (remote)", e)
      }
      return h
    },
    [localOnly],
  )

  const remove = useCallback(
    async (id: string) => {
      await cancelHabitNotifications(id)
      if (localOnly) {
        await deleteLocalHabit(id)
        setHabits((prev) => prev.filter((x) => x.id !== id))
        return
      }
      await deleteRemoteHabit(id)
      setHabits((prev) => prev.filter((x) => x.id !== id))
    },
    [localOnly],
  )

  const complete = useCallback(
    async (id: string) => {
      const localDate = format(new Date(), "yyyy-MM-dd")
      if (localOnly) {
        const res = await completeLocalHabit(id, localDate)
        if (!res) return
        setHabits((prev) => prev.map((x) => (x.id === id ? res.habit : x)))
        return res
      }
      const res = await completeRemoteHabit(id, localDate)
      setHabits((prev) => prev.map((x) => (x.id === id ? res.habit : x)))
      return res
    },
    [localOnly],
  )

  const enabledHabits = useMemo(
    () => habits.filter((h) => h.enabled),
    [habits],
  )

  return {
    habits,
    enabledHabits,
    loading,
    error,
    source: localOnly ? ("local" as const) : ("remote" as const),
    refresh,
    create,
    update,
    remove,
    complete,
  }
}
