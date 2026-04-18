"use client"

import { useCallback, useEffect, useState } from "react"
import type { Task } from "@/lib/wellness-data"
import { isManualTimerTask } from "@/lib/wellness-data"

export type WalkPhase = "idle" | "walking" | "stopped"

type CountdownApi = {
  mode: "countdown"
  timeLeft: number
  duration: number
  isActive: boolean
  timerCompleted: boolean
  start: () => void
  walkPhase: undefined
  elapsed: undefined
  startWalk: undefined
  resumeWalk: undefined
  stopWalk: undefined
}

type ManualApi = {
  mode: "manual"
  elapsed: number
  walkPhase: WalkPhase
  duration: number
  timeLeft: number
  isActive: boolean
  timerCompleted: boolean
  startWalk: () => void
  resumeWalk: () => void
  stopWalk: () => void
  start: undefined
}

export type TaskSessionTimerApi = CountdownApi | ManualApi

export function useTaskSessionTimer(
  task: Task,
  onCountdownComplete?: () => void,
): TaskSessionTimerApi {
  const isManual = isManualTimerTask(task)
  const minWalk = task.manualMinSeconds ?? 15
  const targetHint = task.duration > 0 ? task.duration : 60

  const [timeLeft, setTimeLeft] = useState(task.duration)
  const [cdActive, setCdActive] = useState(false)
  const [cdCompleted, setCdCompleted] = useState(false)

  const [elapsed, setElapsed] = useState(0)
  const [walkPhase, setWalkPhase] = useState<WalkPhase>("idle")

  useEffect(() => {
    setTimeLeft(task.duration)
    setCdActive(false)
    setCdCompleted(false)
    setElapsed(0)
    setWalkPhase("idle")
  }, [task.id, task.duration])

  useEffect(() => {
    if (isManual || !cdActive) return
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0
        if (prev <= 1) {
          setCdActive(false)
          setCdCompleted(true)
          onCountdownComplete?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isManual, cdActive, onCountdownComplete])

  useEffect(() => {
    if (!isManual || walkPhase !== "walking") return
    const id = setInterval(() => {
      setElapsed((e) => e + 1)
    }, 1000)
    return () => clearInterval(id)
  }, [isManual, walkPhase])

  const startCountdown = useCallback(() => {
    setTimeLeft(task.duration)
    setCdCompleted(false)
    setCdActive(true)
  }, [task.duration])

  const startWalk = useCallback(() => {
    setElapsed(0)
    setWalkPhase("walking")
  }, [])

  const resumeWalk = useCallback(() => {
    setWalkPhase("walking")
  }, [])

  const stopWalk = useCallback(() => {
    setWalkPhase("stopped")
  }, [])

  if (isManual) {
    const timerCompleted = walkPhase === "stopped" && elapsed >= minWalk
    const isWalking = walkPhase === "walking"
    const syntheticTimeLeft = Math.max(0, targetHint - elapsed)

    return {
      mode: "manual",
      elapsed,
      walkPhase,
      duration: targetHint,
      timeLeft: syntheticTimeLeft,
      isActive: isWalking,
      timerCompleted,
      startWalk,
      resumeWalk,
      stopWalk,
      start: undefined,
    }
  }

  return {
    mode: "countdown",
    timeLeft,
    duration: task.duration,
    isActive: cdActive,
    timerCompleted: cdCompleted,
    start: startCountdown,
    walkPhase: undefined,
    elapsed: undefined,
    startWalk: undefined,
    resumeWalk: undefined,
    stopWalk: undefined,
  }
}
