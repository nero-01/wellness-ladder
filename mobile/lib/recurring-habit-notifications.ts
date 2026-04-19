import Constants from "expo-constants"
import type { RepeatType } from "@/lib/recurring-habit-streak"
import type { RecurringHabit } from "@/lib/recurring-habits-types"

type NotificationsModule = typeof import("expo-notifications")

/**
 * Push / scheduled notifications are not available in Expo Go (SDK 53+). Loading the native
 * module throws — never `import` or `require` it until we know we're not in StoreClient.
 */
let cachedModule: NotificationsModule | null | undefined

function getNotifications(): NotificationsModule | null {
  if (cachedModule !== undefined) return cachedModule
  /**
   * Expo Go (SDK 53+), especially Android: requiring `expo-notifications` throws before any API
   * call. Skip loading the native module entirely in the Expo Go client.
   * @see https://docs.expo.dev/develop/development-builds/introduction/
   */
  if (Constants.appOwnership === "expo") {
    cachedModule = null
    return null
  }
  if (Constants.executionEnvironment === "storeClient") {
    cachedModule = null
    return null
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    cachedModule = require("expo-notifications") as NotificationsModule
    return cachedModule
  } catch {
    cachedModule = null
    return null
  }
}

let handlerReady = false

/** Call once at app startup so foreground notification behavior is defined. */
export function initRecurringNotificationHandler(): void {
  if (handlerReady) return
  const Notifications = getNotifications()
  if (!Notifications) return
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
  const Notifications = getNotifications()
  if (!Notifications) return false
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

async function cancelHabitIdentifiers(
  Notifications: NotificationsModule,
  habitId: string,
): Promise<void> {
  const prefix = `wellness-rh-${habitId}-`
  const all = await Notifications.getAllScheduledNotificationsAsync()
  await Promise.all(
    all
      .filter((n) => (n.identifier ?? "").startsWith(prefix))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  )
}

export async function rescheduleHabitNotifications(habit: RecurringHabit): Promise<void> {
  const Notifications = getNotifications()
  if (!Notifications) return

  initRecurringNotificationHandler()
  const { SchedulableTriggerInputTypes } = Notifications
  await cancelHabitIdentifiers(Notifications, habit.id)

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
    for (const raw of days) {
      const jsDow = Number(raw)
      if (!Number.isInteger(jsDow) || jsDow < 0 || jsDow > 6) continue
      const expoWd = expoWeekdayFromJs(jsDow)
      if (expoWd < 1 || expoWd > 7) continue
      await scheduleWeekly(expoWd, `c${jsDow}`)
    }
  }
}

export async function rescheduleAllHabitNotifications(
  habits: RecurringHabit[],
): Promise<void> {
  const Notifications = getNotifications()
  if (!Notifications) return

  const all = await Notifications.getAllScheduledNotificationsAsync()
  await Promise.all(
    all
      .filter((n) => (n.identifier ?? "").startsWith("wellness-rh-"))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  )
  for (const h of habits) {
    if (h.enabled && h.reminderTime) {
      await rescheduleHabitNotifications(h)
    }
  }
}

export async function cancelHabitNotifications(habitId: string): Promise<void> {
  const Notifications = getNotifications()
  if (!Notifications) return
  await cancelHabitIdentifiers(Notifications, habitId)
}
