import { createClient as createSupabaseJsClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import type { User } from "@supabase/supabase-js"

export type AuthedUser = {
  user: User
  id: string
}

/**
 * Resolves the current user from the Supabase session (cookies) or
 * `Authorization: Bearer <access_token>` (React Native / non-browser clients).
 * Pass the incoming `Request` from Route Handlers so mobile can authenticate.
 */
export async function requireUser(request?: Request): Promise<AuthedUser> {
  const authHeader = request?.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    const jwt = authHeader.slice(7)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) {
      const err = new Error("Server misconfigured") as Error & { status: number }
      err.status = 503
      throw err
    }
    const supabase = createSupabaseJsClient(url, key)
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(jwt)

    if (error || !user) {
      const err = new Error("Unauthorized") as Error & { status: number }
      err.status = 401
      throw err
    }

    return { user, id: user.id }
  }

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

export async function getOptionalUser(request?: Request): Promise<AuthedUser | null> {
  try {
    return await requireUser(request)
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
