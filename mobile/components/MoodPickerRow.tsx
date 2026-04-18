import { Pressable, Text, View } from "react-native"
import { WellnessColors as W } from "@/constants/wellnessTheme"

const MOODS = [
  { emoji: "😢", label: "Sad", value: 1 },
  { emoji: "😔", label: "Down", value: 2 },
  { emoji: "😐", label: "Okay", value: 3 },
  { emoji: "🙂", label: "Good", value: 4 },
  { emoji: "😊", label: "Great", value: 5 },
]

type Props = {
  selectedMood: number | null
  onMoodSelect: (value: number) => void
}

export function MoodPickerRow({ selectedMood, onMoodSelect }: Props) {
  const selected = MOODS.find((m) => m.value === selectedMood)

  return (
    <View style={{ marginTop: 8 }}>
      <Text
        style={{
          fontSize: 13,
          color: W.textMuted,
          textAlign: "center",
          marginBottom: 12,
        }}
      >
        How are you feeling?
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {MOODS.map((m) => {
          const on = selectedMood === m.value
          return (
            <Pressable
              key={m.value}
              onPress={() => onMoodSelect(m.value)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.06)",
                borderWidth: on ? 2 : 0,
                borderColor: W.primary,
                transform: [{ scale: on ? 1.08 : 1 }],
              }}
              accessibilityLabel={m.label}
            >
              <Text style={{ fontSize: 24 }}>{m.emoji}</Text>
            </Pressable>
          )
        })}
      </View>
      {selected ? (
        <Text
          style={{
            fontSize: 13,
            color: W.primary,
            textAlign: "center",
            marginTop: 12,
          }}
        >
          {`You're feeling ${selected.label.toLowerCase()}`}
        </Text>
      ) : null}
    </View>
  )
}
