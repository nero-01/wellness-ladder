import { supabase } from "@/lib/supabase"

/**
 * Base URL for the Next.js deployment (e.g. https://your-app.vercel.app).
 * Omit trailing slash. Used for Prisma-backed routes like /api/users/bootstrap.
 */
function getApiBase(): string {
  const base = process.env.EXPO_PUBLIC_API_URL ?? ""
  return base.replace(/\/$/, "")
}

export async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const base = getApiBase()
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers = new Headers(init?.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }

  const url = path.startsWith("http") ? path : `${base}${path}`
  if (!path.startsWith("http") && !base) {
    throw new Error("Set EXPO_PUBLIC_API_URL to your Next.js origin (e.g. https://app.vercel.app)")
  }
  return fetch(url, { ...init, headers })
}

export async function bootstrapUserProfile(): Promise<void> {
  if (!getApiBase()) {
    console.warn("[wellness] EXPO_PUBLIC_API_URL not set; skipping profile bootstrap")
    return
  }
  const res = await apiFetch("/api/users/bootstrap", { method: "POST" })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Bootstrap failed: ${res.status} ${text}`)
  }
}
