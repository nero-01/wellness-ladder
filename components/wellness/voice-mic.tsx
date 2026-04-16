"use client"

import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VoiceMicProps {
  isPlaying: boolean
  onToggle: () => void
  size?: "sm" | "md" | "lg"
}

export function VoiceMic({ isPlaying, onToggle, size = "md" }: VoiceMicProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12"
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={`rounded-full ${sizeClasses[size]} ${isPlaying ? "text-primary bg-primary/10" : ""}`}
      onClick={onToggle}
    >
      {isPlaying ? (
        <Volume2 className={`${iconSizes[size]} animate-pulse`} />
      ) : (
        <VolumeX className={iconSizes[size]} />
      )}
      <span className="sr-only">{isPlaying ? "Mute voice guidance" : "Play voice guidance"}</span>
    </Button>
  )
}
