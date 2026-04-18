import * as Notifications from "expo-notifications"
import { SchedulableTriggerInputTypes } from "expo-notifications"
import type { RepeatType } from "@/lib/recurring-habit-streak"
import type { RecurringHabit } from "@/lib/recurring-habits-types"

let handlerReady = false

/** Call once at app startup so foreground notification behavior is defined. */
export function initRecurringNotificationHandler(): void {
  if (handlerReady) return
  handlerReady = true
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  })
}

export async function ensureNotificationPermissions(): Promise<boolean> {
  initRecurringNotificationHandler()
  const { status: existing } = await Notifications.getPermissionsAsync()
  if (existing === "granted") return true
  const { status } = await Notifications.requestPermissionsAsync()
  return status === "granted"
}

function parseHm(t: string): { hour: number; minute: number } | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(t.trim())
  if (!m) return null
  const hour = Number(m[1])
  const minute = Number(m[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null
  return { hour, minute }
}

/** Expo weekly trigger: weekday 1 = Sunday … 7 = Saturday */
function expoWeekdayFromJs(jsDow: number): number {
  return jsDow + 1
}

async function cancelHabitIdentifiers(habitId: string): Promise<void> {
  const prefix = `wellness-rh-${habitId}-`
  const all = await Notifications.getAllScheduledNotificationsAsync()
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  )
}

export async function rescheduleHabitNotifications(habit: RecurringHabit): Promise<void> {
  initRecurringNotificationHandler()
  await cancelHabitIdentifiers(habit.id)

  if (!habit.enabled || !habit.reminderTime) return

  const hm = parseHm(habit.reminderTime)
  if (!hm) return

  const granted = await ensureNotificationPermissions()
  if (!granted) return

  const { hour, minute } = hm
  const title = habit.title
  const body =
    habit.description?.trim() || "A small support habit — when it feels right."

  const scheduleWeekly = async (expoWeekday: number, key: string) => {
    await Notifications.scheduleNotificationAsync({
      identifier: `wellness-rh-${habit.id}-w${key}`,
      content: { title, body },
      trigger: {
        type: SchedulableTriggerInputTypes.WEEKLY,
        weekday: expoWeekday,
        hour,
        minute,
      },
    })
  }

  const rt = habit.repeatType as RepeatType
  const days = habit.repeatDays

  if (rt === "daily") {
    await Notifications.scheduleNotificationAsync({
      identifier: `wellness-rh-${habit.id}-daily`,
      content: { title, body },
      trigger: {
        type: SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    })
    return
  }

  if (rt === "weekdays") {
    for (let d = 1; d <= 5; d++) {
      await scheduleWeekly(d + 1, `wd${d}`)
    }
    return
  }

  if (rt === "custom" && days && days.length > 0) {
    for (const jsDow of days) {
      await scheduleWeekly(expoWeekdayFromJs(jsDow), `c${jsDow}`)
    }
  }
}

export async function rescheduleAllHabitNotifications(
  habits: RecurringHabit[],
): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync()
  await Promise.all(
    all
      .filter((n) => n.identifier.startsWith("wellness-rh-"))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  )
  for (const h of habits) {
    if (h.enabled && h.reminderTime) {
      await rescheduleHabitNotifications(h)
    }
  }
}

export async function cancelHabitNotifications(habitId: string): Promise<void> {
  await cancelHabitIdentifiers(habitId)
}
