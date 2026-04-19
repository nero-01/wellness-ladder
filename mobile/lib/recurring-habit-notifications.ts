import Constants from "expo-constants"
import type { RepeatType } from "@/lib/recurring-habit-streak"
import type { RecurringHabit } from "@/lib/recurring-habits-types"

/** Native module handle — typed loosely so we never static-import `expo-notifications`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type NotificationsNative = any

type ScheduledNotifRow = { identifier?: string }

/**
 * Push / scheduled notifications are not available in Expo Go (SDK 53+). Loading the native
 * module throws — never static-import it; lazy-require only when safe, else return null.
 */
let cachedModule: NotificationsNative | null | undefined

function getNotifications(): NotificationsNative | null {
  if (cachedModule !== undefined) return cachedModule
  try {
    /**
     * Expo Go: skip require entirely (Android SDK 53+ throws on load).
     * `appOwnership === "expo"` is the reliable Expo Go signal; `storeClient` is a fallback.
     */
    if (Constants.appOwnership === "expo") {
      cachedModule = null
      return null
    }
    if (Constants.executionEnvironment === "storeClient") {
      cachedModule = null
      return null
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const mod = require("expo-notifications") as NotificationsNative
    cachedModule = mod
    return mod
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
  Notifications: NotificationsNative,
  habitId: string,
): Promise<void> {
  const prefix = `wellness-rh-${habitId}-`
  const all = (await Notifications.getAllScheduledNotificationsAsync()) as ScheduledNotifRow[]
  await Promise.all(
    all
      .filter((n: ScheduledNotifRow) => (n.identifier ?? "").startsWith(prefix))
      .map((n: ScheduledNotifRow) =>
        Notifications.cancelScheduledNotificationAsync(n.identifier),
      ),
  )
}

export async function rescheduleHabitNotifications(habit: RecurringHabit): Promise<void> {
  try {
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
  } catch {
    /* Scheduling is best-effort */
  }
}

export async function rescheduleAllHabitNotifications(
  habits: RecurringHabit[],
): Promise<void> {
  try {
    const Notifications = getNotifications()
    if (!Notifications) return

    const all = (await Notifications.getAllScheduledNotificationsAsync()) as ScheduledNotifRow[]
    await Promise.all(
      all
        .filter((n: ScheduledNotifRow) =>
          (n.identifier ?? "").startsWith("wellness-rh-"),
        )
        .map((n: ScheduledNotifRow) =>
          Notifications.cancelScheduledNotificationAsync(n.identifier),
        ),
    )
    for (const h of habits) {
      if (h.enabled && h.reminderTime) {
        await rescheduleHabitNotifications(h)
      }
    }
  } catch {
    /* Native scheduling unavailable or module failed — habits still load in UI */
  }
}

export async function cancelHabitNotifications(habitId: string): Promise<void> {
  const Notifications = getNotifications()
  if (!Notifications) return
  await cancelHabitIdentifiers(Notifications, habitId)
}
