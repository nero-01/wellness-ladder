"use client"

import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"
import { cn } from "@/lib/utils"

type Props = {
  iconCode: string
  size: number
  className?: string
}

/** Decorative Fluent SVG; pair with visible task title for context. */
export function TaskNotoIcon({ iconCode, size, className }: Props) {
  const src = emojiFamilySvgUrl(iconCode)
  return (
    // eslint-disable-next-line @next/next/no-img-element -- remote SVG from emoji.family
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={cn("pointer-events-none select-none drop-shadow-sm", className)}
      aria-hidden
      loading="lazy"
      decoding="async"
    />
  )
}
