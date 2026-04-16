"use client"

const moods = [
  { emoji: "1F622", label: "Sad", value: 1 },
  { emoji: "1F614", label: "Down", value: 2 },
  { emoji: "1F610", label: "Okay", value: 3 },
  { emoji: "1F642", label: "Good", value: 4 },
  { emoji: "1F60A", label: "Great", value: 5 }
]

interface MoodPickerProps {
  selectedMood: number | null
  onMoodSelect: (value: number) => void
  showLabel?: boolean
}

export function MoodPicker({ selectedMood, onMoodSelect, showLabel = true }: MoodPickerProps) {
  const selectedMoodData = selectedMood !== null 
    ? moods.find(m => m.value === selectedMood) 
    : null

  return (
    <div>
      {showLabel && (
        <p className="text-sm text-muted-foreground text-center mb-4">
          How are you feeling?
        </p>
      )}
      <div className="flex items-center justify-center gap-3">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onMoodSelect(mood.value)}
            className={`h-12 w-12 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 ${
              selectedMood === mood.value 
                ? "bg-primary/20 scale-110 ring-2 ring-primary" 
                : "bg-secondary hover:bg-secondary/80"
            }`}
            aria-label={mood.label}
          >
            {String.fromCodePoint(parseInt(mood.emoji, 16))}
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
