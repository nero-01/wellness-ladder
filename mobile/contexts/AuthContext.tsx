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
import { sanitizeAuthEmailForSupabase } from "@/lib/auth-email"
import { bootstrapUserProfile } from "@/lib/api"
import { signInWithOAuthNative } from "@/lib/supabase-oauth"
import { isSupabaseConfigured, logSupabaseAuthDebug, supabase } from "@/lib/supabase"
import { markOnboardingComplete } from "@/lib/onboarding-storage"
import { mapSupabaseAuthError } from "@/utils/auth-errors"

/** Supabase OAuth providers (same as web `lib/auth.tsx`). */
export type OAuthProviderId = "google" | "apple" | "facebook" | "twitter"

export interface User {
  id: string
  email: string
  name: string
  imageUrl?: string
  isPremium: boolean
  /** Local explore mode — no Supabase session (or anonymous). */
  isGuest?: boolean
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
  /** Supabase only — resends signup confirmation (same redirect as signUp). Not Clerk. */
  resendSignupEmail: (email: string) => Promise<void>
  /**
   * `__DEV__` only. If Supabase is configured: `signInWithPassword` using
   * `EXPO_PUBLIC_DEV_BYPASS_*` (or defaults). Else: same local mock as `EXPO_PUBLIC_USE_MOCK_AUTH`.
   */
  signInWithDevBypass: () => Promise<void>
  signOut: () => Promise<void>
  signInWithOAuth: (provider: OAuthProviderId) => Promise<void>
  /** Friction-light entry: anonymous Supabase when available, else device-local guest. */
  continueAsGuest: () => Promise<void>
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
const GUEST_STORAGE_KEY = "wellness-guest-user-v1"

export function createGuestUser(): User {
  return {
    id: "00000000-0000-4000-8000-000000009u57",
    email: "",
    name: "Explorer",
    isPremium: false,
    isGuest: true,
  }
}

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
          if (stored) {
            const parsed = JSON.parse(stored) as User
            if (!parsed.isGuest) await markOnboardingComplete()
            setUser(parsed)
          } else {
            const guestRaw = await AsyncStorage.getItem(GUEST_STORAGE_KEY)
            if (guestRaw) setUser(JSON.parse(guestRaw) as User)
          }
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
      .then(async ({ data: { session } }) => {
        const mapped = mapUser(session)
        if (mapped) {
          await markOnboardingComplete()
          setUser(mapped)
          return
        }
        try {
          const guestRaw = await AsyncStorage.getItem(GUEST_STORAGE_KEY)
          if (guestRaw) setUser(JSON.parse(guestRaw) as User)
        } catch {
          /* ignore */
        }
      })
      .catch((err: unknown) => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn("[wellness] getSession failed:", err)
        }
      })
      .finally(() => {
        setIsLoaded(true)
      })

    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        void (async () => {
          const mapped = mapUser(session)
          if (mapped) {
            await markOnboardingComplete()
            setUser(mapped)
            try {
              await AsyncStorage.removeItem(GUEST_STORAGE_KEY)
            } catch {
              /* ignore */
            }
            return
          }
          try {
            const guestRaw = await AsyncStorage.getItem(GUEST_STORAGE_KEY)
            if (guestRaw) setUser(JSON.parse(guestRaw) as User)
            else setUser(null)
          } catch {
            setUser(null)
          }
        })()
      })
      subscription = data.subscription
    } catch (err) {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("[wellness] onAuthStateChange failed:", err)
      }
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
      try {
        await AsyncStorage.multiRemove([GUEST_STORAGE_KEY])
      } catch {
        /* ignore */
      }
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      await markOnboardingComplete()
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: sanitizeAuthEmailForSupabase(email),
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
    await logSupabaseAuthDebug("signInWithPassword")
    try {
      await AsyncStorage.removeItem(GUEST_STORAGE_KEY)
    } catch {
      /* ignore */
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
      try {
        await AsyncStorage.removeItem(GUEST_STORAGE_KEY)
      } catch {
        /* ignore */
      }
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      await markOnboardingComplete()
      return { needsEmailConfirmation: false }
    }

    const emailRedirectTo = getAuthEmailRedirectTo()
    const normalizedEmail = sanitizeAuthEmailForSupabase(email)
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: { name: name.trim() },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    })
    if (__DEV__) {
      if (error) {
        // eslint-disable-next-line no-console
        console.warn("[Auth] signUp failed:", error.message)
      } else {
        // eslint-disable-next-line no-console
        console.log("[Auth] signUp ok", {
          hasSession: !!data?.session,
          userId: data?.user?.id,
          confirmationSentAt: data?.user?.confirmation_sent_at ?? null,
        })
      }
    }
    if (error) throw mapSupabaseAuthError(error)

    if (data.session) {
      await logSupabaseAuthDebug("signUpImmediateSession")
      await bootstrapUserProfile().catch(() => {})
      return { needsEmailConfirmation: false }
    }

    return { needsEmailConfirmation: true }
  }, [])

  const resendSignupEmail = useCallback(async (email: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Resend needs Supabase (not available in mock auth).")
    }
    const normalizedEmail = sanitizeAuthEmailForSupabase(email)
    const emailRedirectTo = getAuthEmailRedirectTo()
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: emailRedirectTo ? { emailRedirectTo } : undefined,
    })
    if (error) throw mapSupabaseAuthError(error)
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUser(null)
      try {
        await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, GUEST_STORAGE_KEY])
      } catch {
        /* ignore */
      }
      return
    }
    try {
      await AsyncStorage.removeItem(GUEST_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  const continueAsGuest = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 120))
      const guest = createGuestUser()
      setUser(guest)
      try {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY)
      } catch {
        /* ignore */
      }
      await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest))
      await markOnboardingComplete()
      return
    }

    try {
      const { data, error } = await supabase.auth.signInAnonymously()
      if (!error && data.session) {
        await logSupabaseAuthDebug("signInAnonymously")
        await bootstrapUserProfile().catch(() => {})
        return
      }
    } catch {
      /* fall through to local guest */
    }

    const guest = createGuestUser()
    setUser(guest)
    try {
      await AsyncStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guest))
    } catch {
      /* ignore */
    }
    await markOnboardingComplete()
  }, [])

  const signInWithOAuth = useCallback(async (provider: OAuthProviderId) => {
    if (!isSupabaseConfigured()) {
      throw new Error(
        "Social sign-in needs Supabase. Set EXPO_PUBLIC_SUPABASE_URL and anon JWT in mobile/.env.",
      )
    }
    const redirectTo = getAuthEmailRedirectTo()
    await signInWithOAuthNative(supabase, provider, redirectTo)
    await logSupabaseAuthDebug("signInWithOAuth")
    await bootstrapUserProfile().catch(() => {})
    await markOnboardingComplete()
  }, [])

  const signInWithDevBypass = useCallback(async () => {
    if (!__DEV__) {
      throw new Error("Dev bypass is only available in development.")
    }
    // eslint-disable-next-line no-console
    console.log("[Dev bypass] starting (no fake JWTs; uses seed user or local mock)")
    if (!isSupabaseConfigured()) {
      await new Promise((r) => setTimeout(r, 200))
      const newUser: User = {
        ...MOCK_USER,
        id: "00000000-0000-4000-8000-00000000d3v1",
        email: "dev@wellness.app",
        name: "Dev Bypass",
      }
      setUser(newUser)
      try {
        await AsyncStorage.removeItem(GUEST_STORAGE_KEY)
      } catch {
        /* ignore */
      }
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      await markOnboardingComplete()
      return
    }

    const email =
      process.env.EXPO_PUBLIC_DEV_BYPASS_EMAIL?.trim() || "dev@wellness.test"
    const password =
      process.env.EXPO_PUBLIC_DEV_BYPASS_PASSWORD?.trim() || "WellnessDev123!"

    const { error } = await supabase.auth.signInWithPassword({
      email: sanitizeAuthEmailForSupabase(email),
      password,
    })
    if (error) {
      throw new Error(
        `Dev bypass: create this user in Supabase Auth (email: ${email}) or set EXPO_PUBLIC_DEV_BYPASS_EMAIL / EXPO_PUBLIC_DEV_BYPASS_PASSWORD in mobile/.env. ${error.message}`,
      )
    }
    try {
      await AsyncStorage.removeItem(GUEST_STORAGE_KEY)
    } catch {
      /* ignore */
    }
    await logSupabaseAuthDebug("devBypass")
    await bootstrapUserProfile().catch(() => {})
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoaded,
      isSignedIn: !!user,
      signIn,
      signUp,
      resendSignupEmail,
      signInWithDevBypass,
      signOut,
      signInWithOAuth,
      continueAsGuest,
    }),
    [
      user,
      isLoaded,
      signIn,
      signUp,
      resendSignupEmail,
      signInWithDevBypass,
      signOut,
      signInWithOAuth,
      continueAsGuest,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
