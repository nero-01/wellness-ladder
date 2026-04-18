"use client"

import { Suspense, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getBrowserSupabase } from "@/lib/supabase/browser"

const OTP_TYPES = new Set([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
])

function safeNext(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) return "/"
  return path
}

/**
 * Email confirmation + OAuth return URL. Must match Supabase Auth → Redirect URLs.
 * Hash fragments (#access_token…) never hit the server — this client page handles them.
 */
function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    let cancelled = false

    async function run() {
      const supabase = getBrowserSupabase()
      if (!supabase) {
        router.replace("/auth/sign-up?error=no_client")
        return
      }

      const next = safeNext(searchParams.get("next"))

      const oauthError = searchParams.get("error")
      const oauthDesc = searchParams.get("error_description")
      if (oauthError) {
        const msg = oauthDesc || oauthError
        router.replace(`/sign-in?error=${encodeURIComponent(msg)}`)
        return
      }

      const code = searchParams.get("code")
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (cancelled) return
        if (error) {
          router.replace(
            `/auth/sign-up?error=${encodeURIComponent(error.message)}`,
          )
          return
        }
        await fetch("/api/users/bootstrap", {
          method: "POST",
          credentials: "same-origin",
        })
        router.replace(next)
        router.refresh()
        return
      }

      const token_hash = searchParams.get("token_hash")
      const type = searchParams.get("type")
      if (token_hash && type && OTP_TYPES.has(type)) {
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
        if (cancelled) return
        if (error) {
          router.replace(
            `/auth/sign-up?error=${encodeURIComponent(error.message)}`,
          )
          return
        }
        await fetch("/api/users/bootstrap", {
          method: "POST",
          credentials: "same-origin",
        })
        router.replace(next)
        router.refresh()
        return
      }

      const hash =
        typeof window !== "undefined" ? window.location.hash.slice(1) : ""
      if (hash) {
        const params = new URLSearchParams(hash)
        const access_token = params.get("access_token")
        const refresh_token = params.get("refresh_token")
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          })
          if (cancelled) return
          if (error) {
            router.replace(
              `/auth/sign-up?error=${encodeURIComponent(error.message)}`,
            )
            return
          }
          window.history.replaceState(null, "", window.location.pathname + window.location.search)
          await fetch("/api/users/bootstrap", {
            method: "POST",
            credentials: "same-origin",
          })
          router.replace(next)
          router.refresh()
          return
        }
      }

      router.replace("/auth/sign-up?error=auth")
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <div className="min-h-[40vh] flex items-center justify-center p-6 text-muted-foreground text-sm">
      Signing you in…
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[40vh] flex items-center justify-center text-muted-foreground text-sm">
          Loading…
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  )
}
