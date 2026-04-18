import type { SupabaseClient } from "@supabase/supabase-js"
import * as WebBrowser from "expo-web-browser"

/**
 * Opens the provider OAuth URL and completes the session from the redirect URL (PKCE or implicit).
 */
export async function signInWithOAuthNative(
  supabase: SupabaseClient,
  provider: "google" | "apple" | "facebook" | "twitter",
  redirectTo: string,
): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  })
  if (error) throw error
  if (!data?.url) throw new Error("No OAuth URL returned")

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo)

  if (result.type !== "success" || !result.url) {
    throw new Error("Sign in was cancelled or did not complete.")
  }

  await finalizeSessionFromRedirectUrl(supabase, result.url)
}

async function finalizeSessionFromRedirectUrl(
  supabase: SupabaseClient,
  url: string,
): Promise<void> {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error("Invalid redirect URL from provider.")
  }

  const code = parsed.searchParams.get("code")
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) throw error
    return
  }

  const hash = parsed.hash?.replace(/^#/, "") ?? ""
  if (hash) {
    const p = new URLSearchParams(hash)
    const access_token = p.get("access_token")
    const refresh_token = p.get("refresh_token")
    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      })
      if (error) throw error
      return
    }
  }

  throw new Error(
    "Could not read session from redirect. Check Supabase redirect URLs and OAuth settings.",
  )
}
