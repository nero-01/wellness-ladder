import * as Haptics from "expo-haptics"
import { useCallback, useMemo, useState } from "react"
import { Pressable, ScrollView, Text, View } from "react-native"
import { Mascot } from "@/components/Mascot"
import { miloDriveToMascotState } from "@/lib/milo-mascot-map"
import { getMiloMoodItem, MILO_MOOD_ITEMS } from "@/lib/milo-mood"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessSelection } from "@/lib/wellnessFeedback"

type Props = {
  selectedMood: number | null
  onMoodSelect: (value: number) => void
  /** When true, copy stresses mood is needed for the mood streak. */
  requiredForStreak?: boolean
  locale?: "en" | "af"
}

export function MoodPickerRow({
  selectedMood,
  onMoodSelect,
  requiredForStreak = false,
  locale = "en",
}: Props) {
  const W = useWellnessColors()
  const [rewardKey, setRewardKey] = useState(0)

  const mascotState = useMemo(() => {
    if (selectedMood === null) return "idle" as const
    const item = getMiloMoodItem(selectedMood)
    return item ? miloDriveToMascotState(item.mascot) : ("idle" as const)
  }, [selectedMood])

  const selected = selectedMood !== null ? getMiloMoodItem(selectedMood) : undefined

  const onPick = useCallback(
    (value: number) => {
      wellnessSelection()
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      setRewardKey((k) => k + 1)
      onMoodSelect(value)
    },
    [onMoodSelect],
  )

  const heading =
    requiredForStreak ?
      locale === "af" ?
        "Hoe voel jy? (nodig vir stemming-streep)"
      : "How are you feeling? (required for mood streak)"
    : locale === "af" ?
      "Hoe voel jy?"
    : "How are you feeling?"

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
        {heading}
      </Text>

      <View style={{ alignItems: "center", marginBottom: 8 }}>
        <Mascot
          state={mascotState}
          preset="taskCue"
          motionProfile="calm"
          animated
          locale={locale === "af" ? "af" : "en"}
          rewardKey={rewardKey}
        />
      </View>

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
        {MILO_MOOD_ITEMS.map((m, i) => {
          const on = selectedMood === m.id
          const label = locale === "af" ? m.labelAf : m.label
          return (
            <Pressable
              key={m.id}
              onPress={() => onPick(m.id)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                marginRight: i === MILO_MOOD_ITEMS.length - 1 ? 0 : 8,
                borderRadius: 20,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? W.iconBg : W.surfaceMuted,
                borderWidth: on ? 2 : 0,
                borderColor: W.primary,
                minWidth: 72,
              }}
              accessibilityLabel={label}
              accessibilityState={{ selected: on }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: on ? W.primary : W.text,
                  textAlign: "center",
                }}
                numberOfLines={2}
              >
                {label}
              </Text>
            </Pressable>
          )
        })}
      </ScrollView>

      {selected ?
        <>
          <Text
            style={{
              fontSize: 13,
              color: W.primary,
              textAlign: "center",
              marginTop: 12,
            }}
          >
            {locale === "af" ?
              `Jy voel ${selected.labelAf.toLowerCase()}`
            : `You're feeling ${selected.label.toLowerCase()}`}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: W.textMuted,
              textAlign: "center",
              marginTop: 6,
              lineHeight: 17,
            }}
          >
            {locale === "af" ? selected.hintAf : selected.hint}
          </Text>
        </>
      : null}
    </View>
  )
}
