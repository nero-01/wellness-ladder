"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Check, SkipForward, User } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  StreakBadge,
  CircularProgress,
  MoodPicker,
  VoiceMic,
  TimerDisplay,
  ManualWalkTimerDisplay,
} from "@/components/wellness"
import { useStreak } from "@/hooks/use-streak"
import { useTaskSessionTimer } from "@/hooks/use-task-session-timer"
import { getBreathingPhaseLabel, getTodayTask } from "@/lib/wellness-data"

export default function TaskPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)

  const { streakData, isLoaded, completeTask, hasCompletedToday, displayStreak } = useStreak()
  const task = getTodayTask(displayStreak)

  const timer = useTaskSessionTimer(task, () => setIsPlaying(false))

  const sessionActive =
    timer.mode === "countdown" ? timer.isActive : timer.walkPhase === "walking"

  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if already completed today
  useEffect(() => {
    if (isLoaded && hasCompletedToday && !showCompletion) {
      setShowCompletion(true)
    }
  }, [isLoaded, hasCompletedToday, showCompletion])

  const breathingPhase = useMemo(() => {
    if (timer.mode !== "countdown") return null
    return getBreathingPhaseLabel(task.id, task.duration, timer.timeLeft)
  }, [timer.mode, timer.timeLeft, task.id, task.duration])

  const ringProgress = useMemo(() => {
    if (timer.mode === "manual") {
      if (timer.timerCompleted) return 100
      const target = task.duration > 0 ? task.duration : 60
      return Math.min(100, (timer.elapsed / target) * 100)
    }
    if (timer.timerCompleted) return 100
    return task.duration > 0
      ? ((task.duration - timer.timeLeft) / task.duration) * 100
      : 0
  }, [timer, task.duration])

  const handleVoiceToggle = useCallback(() => {
    setIsPlaying((prev) => !prev)
    if (timer.mode === "countdown") {
      if (!timer.isActive && timer.timeLeft === task.duration) {
        timer.start()
      }
    } else {
      if (timer.walkPhase === "idle") {
        timer.startWalk()
      } else if (timer.walkPhase === "stopped" && !timer.timerCompleted) {
        timer.resumeWalk()
      }
    }
  }, [timer, task.duration])

  const handleStart = useCallback(() => {
    if (timer.mode === "manual") {
      if (timer.walkPhase === "stopped") timer.resumeWalk()
      else timer.startWalk()
    } else {
      timer.start()
    }
    setIsPlaying(true)
  }, [timer])

  const handleStopWalk = useCallback(() => {
    if (timer.mode === "manual") timer.stopWalk()
  }, [timer])

  const handleComplete = useCallback(() => {
    completeTask(task.id, selectedMood || undefined)
    setShowCompletion(true)
  }, [completeTask, task.id, selectedMood])

  const showStartSection =
    timer.mode === "countdown"
      ? !timer.isActive && timer.timeLeft === task.duration
      : timer.walkPhase === "idle" ||
        (timer.walkPhase === "stopped" && !timer.timerCompleted)

  const startLabel =
    timer.mode === "manual" && timer.walkPhase === "stopped"
      ? "Continue walking"
      : timer.mode === "manual"
        ? "Start walk"
        : "Start Task"

  const timerCompleted = timer.timerCompleted

  // Loading state
  if (!isLoaded) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  // Completion state
  if (showCompletion) {
    return (
      <div className="min-h-screen gradient-bg flex flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <Link href="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
          </Link>
          <ThemeToggle />
        </header>

        <main
          className={`flex-1 flex flex-col items-center justify-center px-6 transition-all duration-700 ${
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/30">
            <Check className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Well Done!</h1>
          <p className="text-muted-foreground text-center mb-4">
            {"You've"} completed {"today's"} wellness task.
          </p>
          <StreakBadge days={streakData.currentStreak} size="lg" />
          <p className="text-sm text-muted-foreground text-center mt-4 mb-8">
            Come back tomorrow for your next step up the ladder!
          </p>
          <div className="flex gap-4">
            <Link href="/">
              <Button variant="outline" className="rounded-2xl h-12 px-6">
                Home
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="rounded-2xl h-12 px-6 gradient-primary text-white border-0">
                View Progress
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/profile">
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
              <span className="sr-only">Profile</span>
            </Button>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-6 pb-8">
        {/* Streak & Progress */}
        <div
          className={`flex items-center justify-between mb-8 transition-all duration-500 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <StreakBadge days={displayStreak} />
          <CircularProgress progress={ringProgress} label="1/1" />
        </div>

        {/* Task Card */}
        <Card
          className={`border-0 shadow-xl bg-card mb-6 transition-all duration-700 delay-100 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{"Today's"} Task</span>
              <VoiceMic isPlaying={isPlaying} onToggle={handleVoiceToggle} />
            </div>

            <div className="text-center mb-6">
              <span className="text-4xl mb-4 block">{task.icon}</span>
              <h2 className="text-xl font-semibold text-foreground leading-relaxed">
                {task.title}
              </h2>
              <p className="text-primary mt-2">{task.instruction}</p>
            </div>

            {timer.mode === "countdown" ? (
              <TimerDisplay
                timeLeft={timer.timeLeft}
                duration={task.duration}
                className="mb-6"
              />
            ) : (
              <ManualWalkTimerDisplay
                elapsed={timer.elapsed}
                targetSeconds={task.duration > 0 ? task.duration : 60}
                walkPhase={timer.walkPhase}
                minSeconds={task.manualMinSeconds ?? 15}
                className="mb-6"
              />
            )}

            {showStartSection ? (
              <>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  {timer.mode === "manual"
                    ? "Use Start walk and Stop walk to control the timer."
                    : "Tap the voice icon or start button to begin"}
                </p>
                <Button
                  onClick={handleStart}
                  className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary text-white border-0"
                >
                  {startLabel}
                </Button>
              </>
            ) : null}

            {timer.mode === "manual" && timer.walkPhase === "walking" ? (
              <Button
                variant="outline"
                className="w-full h-14 mt-4 text-lg font-semibold rounded-2xl"
                onClick={handleStopWalk}
              >
                Stop walk
              </Button>
            ) : null}

            {sessionActive && breathingPhase ? (
              <div className="text-center mt-4">
                <p className="text-lg font-medium text-primary animate-pulse">
                  {breathingPhase}
                </p>
              </div>
            ) : null}

            {sessionActive && !breathingPhase ? (
              <div className="text-center mt-4">
                <p className="text-lg font-medium text-primary">Keep going...</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div
          className={`flex gap-4 mb-6 transition-all duration-700 delay-200 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            onClick={handleComplete}
            disabled={!timerCompleted}
            className="flex-1 h-14 text-lg font-semibold rounded-2xl gradient-primary text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="h-5 w-5 mr-2" />
            Done
          </Button>
          <Button
            variant="outline"
            className="h-14 px-6 rounded-2xl text-muted-foreground"
            onClick={() => router.push("/")}
          >
            <SkipForward className="h-5 w-5" />
            <span className="sr-only">Skip task</span>
          </Button>
        </div>

        {/* Mood Picker */}
        <div
          className={`mt-auto transition-all duration-700 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <MoodPicker selectedMood={selectedMood} onMoodSelect={setSelectedMood} />
        </div>
      </main>
    </div>
  )
}
