import { useCallback, useEffect, useRef, useState } from "react"

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function useTimer({
  duration,
  onComplete,
}: {
  duration: number
  onComplete?: () => void
}) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isActive, setIsActive] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setTimeLeft(duration)
    setIsActive(false)
    setIsCompleted(false)
  }, [duration])

  useEffect(() => {
    if (!isActive) return
    const id = setInterval(() => {
      setTimeLeft((prev) => {
        // Guard: avoid re-firing onComplete every tick after 0 (fixes call stack / update loop)
        if (prev <= 0) return 0
        if (prev <= 1) {
          setIsActive(false)
          setIsCompleted(true)
          onCompleteRef.current?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [isActive])

  const start = useCallback(() => {
    setTimeLeft(duration)
    setIsCompleted(false)
    setIsActive(true)
  }, [duration])

  const reset = useCallback(() => {
    setTimeLeft(duration)
    setIsActive(false)
    setIsCompleted(false)
  }, [duration])

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0

  return {
    timeLeft,
    isActive,
    isCompleted,
    progress,
    formattedTime: formatTime(timeLeft),
    start,
    reset,
  }
}
