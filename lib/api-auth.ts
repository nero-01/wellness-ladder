import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export type AuthedUser = {
  user: User
  id: string
}

/**
 * Resolves the current user from the Supabase session (cookie/JWT).
 * Use in Route Handlers and Server Actions that must not trust client-sent user ids.
 */
export async function requireUser(): Promise<AuthedUser> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    const err = new Error("Unauthorized") as Error & { status: number }
    err.status = 401
    throw err
  }

  return { user, id: user.id }
}

export async function getOptionalUser(): Promise<AuthedUser | null> {
  try {
    return await requireUser()
  } catch {
    return null
  }
}

/**
 * Verifies cron / internal calls using a shared secret (never expose to the client).
 */
export function assertCronSecret(request: Request): void {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    const err = new Error("CRON_SECRET not configured") as Error & { status: number }
    err.status = 503
    throw err
  }
  const auth = request.headers.get("authorization")
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null
  if (token !== secret) {
    const err = new Error("Forbidden") as Error & { status: number }
    err.status = 403
    throw err
  }
}
