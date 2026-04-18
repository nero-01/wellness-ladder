"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { StreakBadge } from "@/components/wellness/streak-badge"
import { TaskNotoIcon } from "@/components/wellness/task-noto-icon"
import { wellnessWebTap } from "@/lib/wellness-feedback"
import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"
import { getTodayTask } from "@/lib/wellness-data"
import type { StreakData } from "@/lib/wellness-data"
import { isWellnessPro } from "@/lib/wellness-pro"
import { ChevronLeft, Check } from "lucide-react"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

type Props = {
  streakData: StreakData
  mounted: boolean
}

const STREAK_FLAME_NOTO = "1f525"

export function TaskCompletionCelebration({ streakData, mounted }: Props) {
  const [animationData, setAnimationData] = useState<object | null>(null)

  useEffect(() => {
    let cancelled = false
    void fetch("/lottie/confetti.json")
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setAnimationData(data)
      })
      .catch(() => {
        /* ignore missing lottie in dev */
      })
    return () => {
      cancelled = true
    }
  }, [])

  const nextTask = getTodayTask(streakData.currentStreak + 1)
  const streakFlameSrc = emojiFamilySvgUrl(STREAK_FLAME_NOTO, "noto")
  const pro = isWellnessPro()

  return (
    <div className="min-h-screen gradient-bg flex flex-col relative overflow-hidden">
      {animationData ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 flex justify-center h-[min(55vh,420px)] z-0"
          aria-hidden
        >
          <Lottie
            animationData={animationData}
            loop={false}
            className="w-full max-w-lg opacity-95"
          />
        </div>
      ) : null}

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link href="/" onClick={() => wellnessWebTap()}>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <ThemeToggle />
      </header>

      <main
        className={`relative z-10 flex-1 flex flex-col items-center px-6 pb-10 transition-all duration-700 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <div className="h-20 w-20 rounded-full gradient-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/30 shrink-0">
          <Check className="h-10 w-10 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">
          Well done!
        </h1>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          {"You've"} completed {"today's"} wellness task. See you tomorrow for the next step.
        </p>

        <div className="flex items-center justify-center gap-3 mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote Noto streak asset */}
          <img
            src={streakFlameSrc}
            alt=""
            width={44}
            height={44}
            className="pointer-events-none select-none drop-shadow-sm shrink-0"
            aria-hidden
          />
          <StreakBadge days={streakData.currentStreak} size="lg" />
        </div>

        <Card className="w-full max-w-md border border-border/80 shadow-lg bg-card/95 backdrop-blur-sm mb-6">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
              Next on your ladder
            </p>
            <div className="flex gap-4 items-start">
              <TaskNotoIcon
                iconCode={nextTask.iconCode}
                size={48}
                className="shrink-0"
              />
              <div className="min-w-0">
                <p className="font-semibold text-foreground leading-snug">
                  {nextTask.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
                  {nextTask.instruction}
                </p>
                <p className="text-xs text-primary mt-2">~{nextTask.duration}s · tomorrow</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {pro ? (
          <Card className="w-full max-w-md border-primary/25 bg-primary/5 mb-8">
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
                Pro bonus
              </p>
              <p className="text-sm text-foreground">
                Extra calm: open Goals anytime for a second micro-win — your streak still counts one task per day.
              </p>
            </CardContent>
          </Card>
        ) : null}

        <div className="flex gap-4 mt-auto">
          <Link href="/">
            <Button variant="outline" className="rounded-2xl h-12 px-6">
              Home
            </Button>
          </Link>
          <Link href="/profile">
            <Button className="rounded-2xl h-12 px-6 gradient-primary text-white border-0">
              View progress
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
