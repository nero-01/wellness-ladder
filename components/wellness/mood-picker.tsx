"use client"

import { wellnessWebTap } from "@/lib/wellness-feedback"
import {
  MOOD_PICKER_ITEMS,
  moodSvgUrlFromFamily,
  moods,
} from "@/lib/mood-picker-data"

interface MoodPickerProps {
  selectedMood: number | null
  onMoodSelect: (value: number) => void
  showLabel?: boolean
}

export function MoodPicker({ selectedMood, onMoodSelect, showLabel = true }: MoodPickerProps) {
  const selectedMoodData =
    selectedMood !== null ? MOOD_PICKER_ITEMS.find((m) => m.value === selectedMood) : null

  return (
    <div>
      {showLabel && (
        <p className="text-sm text-muted-foreground text-center mb-4">
          How are you feeling?
        </p>
      )}
      <div className="flex items-center justify-center gap-3">
        {MOOD_PICKER_ITEMS.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => {
              wellnessWebTap()
              onMoodSelect(mood.value)
            }}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-200 p-1.5 ${
              selectedMood === mood.value
                ? "bg-primary/20 scale-110 ring-2 ring-primary"
                : "bg-secondary hover:bg-secondary/80"
            }`}
            aria-label={mood.label}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={moodSvgUrlFromFamily(mood.family)}
              alt=""
              width={32}
              height={32}
              className="pointer-events-none select-none drop-shadow-sm"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>
      {selectedMoodData && (
        <p className="text-sm text-primary text-center mt-3 animate-in fade-in duration-300">
          {"You're"} feeling {selectedMoodData.label.toLowerCase()}
        </p>
      )}
    </div>
  )
}

export { moods }
