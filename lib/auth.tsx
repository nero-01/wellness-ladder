"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import type { AuthChangeEvent, Session } from "@supabase/supabase-js"
import { sanitizeAuthEmailForSupabase } from "@/lib/auth-email"
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/browser"

export interface User {
  id: string
  email: string
  name: string
  imageUrl?: string
  isPremium: boolean
}

/** Supabase OAuth providers used on the sign-up page (maps to `signInWithOAuth`). */
export type OAuthProviderId = "google" | "apple" | "facebook" | "twitter"

/** After email/password sign-up: `true` when Supabase requires email confirmation (no session yet). */
export type SignUpResult = { needsEmailConfirmation: boolean }

interface AuthContextType {
  user: User | null
  isLoaded: boolean
  isSignedIn: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<SignUpResult>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: OAuthProviderId) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const MOCK_USER: User = {
  id: "user_demo",
  email: "demo@wellness.app",
  name: "Wellness User",
  isPremium: false,
}

const AUTH_STORAGE_KEY = "wellness-auth-user"

/** Optional dev-only gate: set both in `.env.local` to require a fixed email/password in mock mode. */
function getMockDevCredentials():
  | { email: string; password: string }
  | null {
  const email = process.env.NEXT_PUBLIC_MOCK_DEV_EMAIL?.trim()
  const password = process.env.NEXT_PUBLIC_MOCK_DEV_PASSWORD?.trim()
  if (email && password) return { email, password }
  return null
}

function assertMockSignIn(email: string, password: string) {
  const fixed = getMockDevCredentials()
  if (!fixed) return
  if (email.trim() !== fixed.email || password !== fixed.password) {
    throw new Error("Invalid email or password")
  }
}

function mapSupabaseUser(session: Session | null): User | null {
  if (!session?.user) return null
  const u = session.user
  const meta = u.user_metadata as Record<string, unknown> | undefined
  const name =
    typeof meta?.name === "string" ? meta.name
    : u.email?.split("@")[0] ?? "User"
  return {
    id: u.id,
    email: u.email ?? "",
    name,
    imageUrl: typeof meta?.avatar_url === "string" ? meta.avatar_url : undefined,
    isPremium: meta?.is_premium === true,
  }
}

async function bootstrapProfile() {
  await fetch("/api/users/bootstrap", { method: "POST", credentials: "same-origin" })
}

/**
 * OAuth + email confirmation return URL — must match Supabase Auth → Redirect URLs
 * (e.g. `https://yourapp.com/auth/callback`).
 */
function getAuthCallbackUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "").trim()
  const origin =
    fromEnv ||
    (typeof window !== "undefined" ? window.location.origin : "")
  if (!origin) return ""
  return `${origin}/auth/callback?next=${encodeURIComponent("/")}`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      try {
        const stored = localStorage.getItem(AUTH_STORAGE_KEY)
        if (stored) setUser(JSON.parse(stored) as User)
      } catch {
        /* ignore */
      }
      setIsLoaded(true)
      return
    }

    const supabase = getBrowserSupabase()
    if (!supabase) {
      setIsLoaded(true)
      return
    }

    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setUser(mapSupabaseUser(data.session))
      setIsLoaded(true)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(mapSupabaseUser(session))
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      assertMockSignIn(email, password)
      const em = sanitizeAuthEmailForSupabase(email)
      const newUser: User = {
        ...MOCK_USER,
        email: em,
        name: em.split("@")[0] ?? "User",
      }
      setUser(newUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      return
    }

    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error("Supabase client unavailable")

    const { error } = await supabase.auth.signInWithPassword({
      email: sanitizeAuthEmailForSupabase(email),
      password,
    })
    if (error) {
      const msg = error.message || "Sign in failed"
      if (/Invalid login credentials|Invalid email or password/i.test(msg)) {
        throw new Error(
          "Invalid email or password. Create the user in Supabase (Sign up), or use local mock auth: set NEXT_PUBLIC_USE_MOCK_AUTH=true in .env.local (see .env.example).",
        )
      }
      throw new Error(msg)
    }
    await bootstrapProfile()
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured()) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const em = sanitizeAuthEmailForSupabase(email)
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: em,
        name,
        isPremium: false,
      }
      setUser(newUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      return { needsEmailConfirmation: false }
    }

    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error("Supabase client unavailable")

    const emailRedirectTo = getAuthCallbackUrl()
    const normalizedEmail = sanitizeAuthEmailForSupabase(email)
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    })
    if (error) throw error

    if (data.session) {
      await bootstrapProfile()
      return { needsEmailConfirmation: false }
    }

    return { needsEmailConfirmation: true }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null)
      localStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }
    const supabase = getBrowserSupabase()
    if (supabase) await supabase.auth.signOut()
    setUser(null)
  }, [])

  const signInWithOAuth = useCallback(async (provider: OAuthProviderId) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Social sign-in requires Supabase. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      )
    }
    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error("Supabase client unavailable")

    const redirectTo = getAuthCallbackUrl()
    if (!redirectTo) {
      throw new Error(
        "Could not build callback URL. Set NEXT_PUBLIC_SITE_URL in production.",
      )
    }
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    })
    if (error) throw error
    if (data.url) window.location.assign(data.url)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: !!user,
        signIn,
        signUp,
        signOut,
        signInWithOAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function SignInButton({ children }: { children?: ReactNode }) {
  return (
    <button type="button" onClick={() => (window.location.href = "/sign-in")}>
      {children || "Sign In"}
    </button>
  )
}

export function SignUpButton({ children }: { children?: ReactNode }) {
  return (
    <button type="button" onClick={() => (window.location.href = "/auth/sign-up")}>
      {children || "Sign Up"}
    </button>
  )
}

export function UserButton() {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <button
      type="button"
      title="Sign out"
      aria-label="Sign out"
      onClick={() => void signOut()}
      className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium shrink-0"
    >
      {user.name.charAt(0).toUpperCase()}
    </button>
  )
}
