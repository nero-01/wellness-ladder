import type { Session } from "@supabase/supabase-js"
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

interface AuthContextType {
  user: User | null
  isLoaded: boolean
  isSignedIn: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
      setIsLoaded(true)
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
      throw new Error("Supabase is not configured (missing EXPO_PUBLIC_* env).")
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    await bootstrapUserProfile().catch(() => {
      /* backend optional in dev */
    })
  }, [])

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase is not configured (missing EXPO_PUBLIC_* env).")
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    })
    if (error) throw error
    await bootstrapUserProfile().catch(() => {})
  }, [])

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured()) return
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
