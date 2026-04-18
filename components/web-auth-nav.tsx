"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth, UserButton } from "@/lib/auth"

type WebAuthNavProps = {
  /** `minimal`: only prompt sign-in when logged out (e.g. task header). `full`: sign-in, sign-up, account when logged in. */
  mode?: "full" | "minimal"
}

export function WebAuthNav({ mode = "full" }: WebAuthNavProps) {
  const { user, isLoaded, isSignedIn } = useAuth()

  if (!isLoaded) {
    return (
      <div
        className="h-9 min-w-[7rem] rounded-md bg-muted/60 animate-pulse"
        aria-hidden
      />
    )
  }

  if (!isSignedIn || !user) {
    if (mode === "minimal") {
      return (
        <Button variant="outline" size="sm" className="shrink-0" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      )
    }
    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <Button variant="ghost" size="sm" className="text-foreground" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button size="sm" className="shrink-0" asChild>
          <Link href="/auth/sign-up">Sign up</Link>
        </Button>
      </div>
    )
  }

  if (mode === "minimal") {
    return null
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 max-w-[min(100%,14rem)] sm:max-w-none">
      <span
        className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:inline max-w-[10rem] md:max-w-[12rem]"
        title={user.email}
      >
        {user.email}
      </span>
      <Button variant="ghost" size="sm" className="hidden sm:inline-flex px-2" asChild>
        <Link href="/profile">Account</Link>
      </Button>
      <UserButton />
    </div>
  )
}
