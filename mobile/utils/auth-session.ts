import type { User } from "@/contexts/AuthContext"

/** Whether the app considers a user signed in (use `useAuth().isSignedIn` in components). */
export function isSignedIn(user: User | null): boolean {
  return !!user
}
