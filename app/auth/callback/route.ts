import { NextResponse } from "next/server"
import { ensureUserProfile } from "@/lib/ensure-user-profile"
import { createClient } from "@/lib/supabase/server"

const EMAIL_OTP_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
])

function safeNext(path: string | null, origin: string): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/"
  }
  return path
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const next = safeNext(searchParams.get("next"), origin)

  const oauthError = searchParams.get("error")
  const oauthDesc = searchParams.get("error_description")
  if (oauthError) {
    const msg = oauthDesc || oauthError
    return NextResponse.redirect(
      `${origin}/sign-in?error=${encodeURIComponent(msg)}`,
    )
  }

  const code = searchParams.get("code")
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")

  try {
    const supabase = await createClient()

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await ensureUserProfile(user.id, user.email ?? null)
        }
        return NextResponse.redirect(`${origin}${next}`)
      }
    }

    if (token_hash && type && EMAIL_OTP_TYPES.has(type)) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as
          | "signup"
          | "invite"
          | "magiclink"
          | "recovery"
          | "email_change"
          | "email",
      })
      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          await ensureUserProfile(user.id, user.email ?? null)
        }
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  } catch {
    /* missing env or exchange failure */
  }

  return NextResponse.redirect(`${origin}/auth/sign-up?error=auth`)
}
