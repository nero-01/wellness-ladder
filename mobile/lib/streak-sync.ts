import { apiFetch } from "@/lib/api"

/**
 * Best-effort sync of streak fields to Prisma (requires EXPO_PUBLIC_API_URL + auth).
 * Does not throw — failures are logged only.
 */
export async function syncStreakToRemote(streak: {
  currentStreak: number
  totalCompleted: number
  lastCompletedDate: string | null
}): Promise<void> {
  try {
    const last =
      streak.lastCompletedDate === null ?
        null
      : `${streak.lastCompletedDate}T12:00:00.000Z`
    const res = await apiFetch("/api/users/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        streak: streak.currentStreak,
        totalCompleted: streak.totalCompleted,
        lastCompletedDate: last,
      }),
    })
    if (!res.ok) {
      console.warn("[wellness] streak sync failed", res.status)
    }
  } catch (e) {
    console.warn("[wellness] streak sync error", e)
  }
}
