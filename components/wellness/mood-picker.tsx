"use client"

import Image from "next/image"
import { wellnessWebTap } from "@/lib/wellness-feedback"
import { MILO_MOOD_ITEMS, getMiloMoodItem } from "@/lib/mood-picker-data"

interface MoodPickerProps {
  selectedMood: number | null
  onMoodSelect: (value: number) => void
  showLabel?: boolean
}

export function MoodPicker({ selectedMood, onMoodSelect, showLabel = true }: MoodPickerProps) {
  const selected = selectedMood !== null ? getMiloMoodItem(selectedMood) : undefined

  return (
    <div>
      {showLabel ?
        <p className="text-sm text-muted-foreground text-center mb-4">
          How are you feeling?
        </p>
      : null}

      <div className="flex flex-col items-center gap-4 mb-2">
        <div className="relative h-[120px] w-[220px] shrink-0">
          <Image
            src="/mascot/mascot-transparent.png"
            alt=""
            fill
            className="object-contain object-center pointer-events-none select-none"
            sizes="220px"
            priority={false}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
        {MILO_MOOD_ITEMS.map((mood) => (
          <button
            key={mood.id}
            type="button"
            onClick={() => {
              wellnessWebTap()
              onMoodSelect(mood.id)
            }}
            className={`min-h-11 px-3.5 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
              selectedMood === mood.id ?
                "bg-primary/20 ring-2 ring-primary text-primary scale-[1.02]"
              : "bg-secondary hover:bg-secondary/80 text-foreground"
            }`}
            aria-pressed={selectedMood === mood.id}
            aria-label={mood.label}
          >
            {mood.label}
          </button>
        ))}
      </div>

      {selected ?
        <div className="mt-3 text-center space-y-1 animate-in fade-in duration-300">
          <p className="text-sm text-primary">
            {"You're"} feeling {selected.label.toLowerCase()}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
            {selected.hint}
          </p>
        </div>
      : null}
    </div>
  )
}

export { moods } from "@/lib/mood-picker-data"
