import { apiFetch } from "@/lib/api"

/** Best-effort POST mood to Prisma when API + auth available. Offline-first. */
export async function syncMoodToRemote(mood: number, dateKey: string): Promise<void> {
  try {
    const loggedAt = `${dateKey}T12:00:00.000Z`
    const res = await apiFetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, loggedAt }),
    })
    if (!res.ok) {
      console.warn("[wellness] mood sync failed", res.status)
    }
  } catch (e) {
    console.warn("[wellness] mood sync error", e)
  }
}
