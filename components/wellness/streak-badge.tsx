"use client"

import { Flame } from "lucide-react"

interface StreakBadgeProps {
  days: number
  size?: "sm" | "md" | "lg"
}

export function StreakBadge({ days, size = "md" }: StreakBadgeProps) {
  const sizeClasses = {
    sm: "h-8 px-3 text-sm gap-1.5",
    md: "h-12 px-4 text-lg gap-2",
    lg: "h-14 px-5 text-xl gap-2.5"
  }

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <div 
      className={`rounded-2xl bg-accent flex items-center font-medium text-accent-foreground ${sizeClasses[size]}`}
    >
      <span>Day {days}</span>
      <Flame className={`${iconSizes[size]} text-orange-500`} />
    </div>
  )
}
