"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { VoiceMic } from "./voice-mic"
import { TimerDisplay } from "./timer"

export interface Task {
  id: number
  title: string
  instruction: string
  duration: number
  icon: string
}

interface TaskCardProps {
  task: Task
  timeLeft: number
  isPlaying: boolean
  isActive: boolean
  onVoiceToggle: () => void
  onStart: () => void
}

export function TaskCard({ 
  task, 
  timeLeft, 
  isPlaying, 
  isActive, 
  onVoiceToggle, 
  onStart 
}: TaskCardProps) {
  const getBreathingPhase = (time: number, duration: number) => {
    if (task.id !== 1) return null
    const elapsed = duration - time
    const cycle = elapsed % 12
    if (cycle < 4) return "Breathe in..."
    if (cycle < 8) return "Hold..."
    return "Breathe out..."
  }

  const breathingPhase = getBreathingPhase(timeLeft, task.duration)

  return (
    <Card className="border-0 shadow-xl bg-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">{"Today's"} Task</span>
          <VoiceMic isPlaying={isPlaying} onToggle={onVoiceToggle} />
        </div>

        <div className="text-center mb-6">
          <span className="text-4xl mb-4 block">{task.icon}</span>
          <h2 className="text-xl font-semibold text-foreground leading-relaxed">
            {task.title}
          </h2>
          <p className="text-primary mt-2">{task.instruction}</p>
        </div>

        <TimerDisplay 
          timeLeft={timeLeft} 
          duration={task.duration} 
          className="mb-6"
        />

        {!isActive && timeLeft === task.duration && (
          <>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Tap the voice icon or start button to begin
            </p>
            <Button 
              onClick={onStart}
              className="w-full h-14 text-lg font-semibold rounded-2xl gradient-primary text-white border-0"
            >
              Start Task
            </Button>
          </>
        )}

        {isActive && breathingPhase && (
          <div className="text-center">
            <p className="text-lg font-medium text-primary animate-pulse">
              {breathingPhase}
            </p>
          </div>
        )}

        {isActive && !breathingPhase && (
          <div className="text-center">
            <p className="text-lg font-medium text-primary">
              Keep going...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
