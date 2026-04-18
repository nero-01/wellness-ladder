import type { Session } from "@supabase/supabase-js"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Linking from "expo-linking"
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { bootstrapUserProfile } from "@/lib/api"
import { isSupabaseConfigured, supabase } from "@/lib/supabase"

export interface User {
  id: string
  email: string
  name: string
  imageUrl?: string
  isPremium: boolean
}

/** Mirrors web `lib/auth.tsx` — true when Supabase is waiting for email confirmation. */
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/** Default profile when using mock auth — edit here for seed data. Id is UUID-shaped for Prisma/API compatibility. */
const MOCK_USER: User = {
  id: "00000000-0000-4000-8000-000000000001",
  email: "demo@wellness.app",
  name: "Wellness User",
  isPremium: false,
}

const AUTH_STORAGE_KEY = "wellness-auth-user"

function getMockDevCredentials():
  | { email: string; password: string }
  | null {
  const email = process.env.EXPO_PUBLIC_MOCK_DEV_EMAIL?.trim()
  const password = process.env.EXPO_PUBLIC_MOCK_DEV_PASSWORD?.trim()
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

/**
 * Must match Supabase Auth → Redirect URLs (use HTTPS production URL via EXPO_PUBLIC_AUTH_REDIRECT_URL).
 */
function getAuthEmailRedirectTo(): string {
  const explicit = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URL?.trim()
  if (explicit) {
    return explicit.includes("?")
      ? explicit
      : `${explicit}?next=${encodeURIComponent("/")}`
  }
  return Linking.createURL("auth/callback", {
    queryParams: { next: "/" },
  })
}

function mapUser(session: Session | null): User | null {
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      void (async () => {
        try {
          const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY)
          if (stored) setUser(JSON.parse(stored) as User)
        } catch {
          /* ignore */
        } finally {
          setIsLoaded(true)
        }
      })()
      return
    }

    let subscription: { unsubscribe: () => void } | undefined

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(mapUser(session))
      })
      .catch((err: unknown) => {
        console.warn("[wellness] getSession failed:", err)
      })
      .finally(() => {
        setIsLoaded(true)
      })

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(mapUser(session))
      })
      subscription = data.subscription
    } catch (err) {
      console.warn("[wellness] onAuthStateChange failed:", err)
    }

    return () => subscription?.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 300))
      assertMockSignIn(email, password)
      const newUser: User = {
        ...MOCK_USER,
        email: email.trim(),
        name: email.trim().split("@")[0] ?? "User",
      }
      setUser(newUser)
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) {
      const msg = error.message || "Sign in failed"
      if (/Invalid login credentials|Invalid email or password/i.test(msg)) {
        throw new Error(
          "Invalid email or password. Create the user in Supabase, set EXPO_PUBLIC_USE_MOCK_AUTH=true for local mock, or use a JWT anon key (eyJ…).",
        )
      }
      throw new Error(msg)
    }
    await bootstrapUserProfile().catch(() => {
      /* backend optional in dev */
    })
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 300))
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: email.trim(),
        name: name.trim() || email.split("@")[0] || "User",
        isPremium: false,
      }
      setUser(newUser)
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      return { needsEmailConfirmation: false }
    }

    const emailRedirectTo = getAuthEmailRedirectTo()
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { name: name.trim() },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    })
    if (error) throw error

    if (data.session) {
      await bootstrapUserProfile().catch(() => {})
      return { needsEmailConfirmation: false }
    }

    return { needsEmailConfirmation: true }
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null)
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoaded,
      isSignedIn: !!user,
      signIn,
      signUp,
      signOut,
    }),
    [user, isLoaded, signIn, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
