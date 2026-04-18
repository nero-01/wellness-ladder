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
import { getBrowserSupabase, isSupabaseConfigured } from "@/lib/supabase/browser"

export interface User {
  id: string
  email: string
  name: string
  imageUrl?: string
  isPremium: boolean
}

interface AuthContextType {
  user: User | null
  isLoaded: boolean
  isSignedIn: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
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
      const newUser: User = {
        ...MOCK_USER,
        email: email.trim(),
        name: email.trim().split("@")[0] ?? "User",
      }
      setUser(newUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      return
    }

    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error("Supabase client unavailable")

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
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
      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        name,
        isPremium: false,
      }
      setUser(newUser)
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      return
    }

    const supabase = getBrowserSupabase()
    if (!supabase) throw new Error("Supabase client unavailable")

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    await bootstrapProfile()
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isSignedIn: !!user,
        signIn,
        signUp,
        signOut,
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
    <button type="button" onClick={() => (window.location.href = "/sign-up")}>
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
      onClick={() => void signOut()}
      className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium"
    >
      {user.name.charAt(0).toUpperCase()}
    </button>
  )
}
