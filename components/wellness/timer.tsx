"use client"

import { useEffect, useState, useCallback } from "react"

interface TimerProps {
  duration: number
  onComplete?: () => void
  onTick?: (timeLeft: number) => void
  autoStart?: boolean
}

export function useTimer({ duration, onComplete, onTick, autoStart = false }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isActive, setIsActive] = useState(autoStart)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1
          onTick?.(newTime)
          return newTime
        })
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false)
      setIsCompleted(true)
      onComplete?.()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, onComplete, onTick])

  const start = useCallback(() => {
    setIsActive(true)
  }, [])

  const pause = useCallback(() => {
    setIsActive(false)
  }, [])

  const reset = useCallback(() => {
    setTimeLeft(duration)
    setIsActive(false)
    setIsCompleted(false)
  }, [duration])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progress = ((duration - timeLeft) / duration) * 100

  return {
    timeLeft,
    isActive,
    isCompleted,
    progress,
    formattedTime: formatTime(timeLeft),
    start,
    pause,
    reset
  }
}

interface TimerDisplayProps {
  timeLeft: number
  duration: number
  className?: string
}

export function TimerDisplay({ timeLeft, duration, className = "" }: TimerDisplayProps) {
  const progress = ((duration - timeLeft) / duration) * 100
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={className}>
      <div className="h-3 rounded-full bg-secondary overflow-hidden">
        <div 
          className="h-full rounded-full gradient-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-sm text-muted-foreground">Timer</span>
        <span className="text-sm font-mono font-semibold text-foreground">
          {formatTime(timeLeft)}
        </span>
      </div>
    </div>
  )
}
