import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { Pressable, ScrollView, Text, View } from "react-native"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessSelection } from "@/lib/wellnessFeedback"
import {
  MOOD_PICKER_ITEMS,
  moodNotoSvgUrlFromFamily,
} from "@/lib/mood-picker-data"

const MOOD_IMAGE_SIZE = 38

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
    <View style={{ marginTop: 0 }}>
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}
      >
        {MOOD_PICKER_ITEMS.map((m, i) => {
          const on = selectedMood === m.value
          const uri = moodNotoSvgUrlFromFamily(m.family)
          return (
            <Pressable
              key={m.value}
              onPress={() => {
                wellnessSelection()
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
                onMoodSelect(m.value)
              }}
              style={{
                width: 52,
                height: 52,
                marginRight: i === MOOD_PICKER_ITEMS.length - 1 ? 0 : 12,
                borderRadius: 18,
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
      </ScrollView>
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
