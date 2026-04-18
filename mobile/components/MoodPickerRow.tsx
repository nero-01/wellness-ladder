import { Image } from "expo-image"
import { Pressable, Text, View } from "react-native"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessSelection } from "@/lib/wellnessFeedback"
import {
  MOOD_PICKER_ITEMS,
  moodNotoSvgUrlFromFamily,
} from "@/lib/mood-picker-data"

const MOOD_IMAGE_SIZE = 34

type Props = {
  selectedMood: number | null
  onMoodSelect: (value: number) => void
  /** When true, copy stresses mood is needed for the mood streak. */
  requiredForStreak?: boolean
}

export function MoodPickerRow({
  selectedMood,
  onMoodSelect,
  requiredForStreak = false,
}: Props) {
  const W = useWellnessColors()
  const selected = MOOD_PICKER_ITEMS.find((m) => m.value === selectedMood)

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
        {requiredForStreak ?
          "How are you feeling? (required for mood streak)"
        : "How are you feeling?"}
      </Text>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        {MOOD_PICKER_ITEMS.map((m) => {
          const on = selectedMood === m.value
          const uri = moodNotoSvgUrlFromFamily(m.family)
          return (
            <Pressable
              key={m.value}
              onPress={() => {
                wellnessSelection()
                onMoodSelect(m.value)
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? W.iconBg : W.surfaceMuted,
                borderWidth: on ? 2 : 0,
                borderColor: W.primary,
                transform: [{ scale: on ? 1.08 : 1 }],
              }}
              accessibilityLabel={m.label}
            >
              <Image
                source={{ uri }}
                style={{
                  width: MOOD_IMAGE_SIZE,
                  height: MOOD_IMAGE_SIZE,
                }}
                contentFit="contain"
                cachePolicy="memory-disk"
                transition={80}
              />
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
