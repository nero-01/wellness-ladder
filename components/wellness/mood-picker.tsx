"use client"

import { wellnessWebTap } from "@/lib/wellness-feedback"
import {
  getMiloMoodItem,
  MILO_MOOD_ITEMS,
  moodNotoSvgUrlFromFamily,
} from "@/lib/mood-picker-data"

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
        <div className="text-center mb-2">
          <p className="text-sm font-semibold text-foreground">How are you feeling?</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Tap the face that fits best — we’ll save it for your mood streak.
          </p>
        </div>
      : null}

      <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto justify-items-stretch">
        {MILO_MOOD_ITEMS.map((mood) => {
          const on = selectedMood === mood.id
          const src = moodNotoSvgUrlFromFamily(mood.emojiFamily)
          return (
            <button
              key={mood.id}
              type="button"
              onClick={() => {
                wellnessWebTap()
                onMoodSelect(mood.id)
              }}
              className={`flex flex-col items-center rounded-2xl border px-1.5 py-2.5 transition-all duration-200 min-h-[92px] ${
                on ?
                  "bg-primary/15 border-primary ring-2 ring-primary/40 shadow-md shadow-primary/10 scale-[1.02]"
                : "bg-secondary/80 border-border/80 hover:bg-secondary hover:border-border"
              }`}
              aria-pressed={selectedMood === mood.id}
              aria-label={mood.label}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- remote Noto mood asset */}
              <img
                src={src}
                alt=""
                width={40}
                height={40}
                className="pointer-events-none select-none drop-shadow-sm mb-1"
                loading="lazy"
                decoding="async"
              />
              <span
                className={`text-[10px] font-bold leading-tight text-center px-0.5 ${
                  on ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {mood.label}
              </span>
            </button>
          )
        })}
      </div>

      {selected ?
        <div className="mt-4 text-center space-y-1 animate-in fade-in duration-300">
          <p className="text-sm font-medium text-primary">
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
