import * as Haptics from "expo-haptics"
import { Image } from "expo-image"
import { useCallback, useMemo } from "react"
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { getMiloMoodItem, MILO_MOOD_ITEMS } from "@/lib/milo-mood"
import { moodNotoSvgUrlFromFamily } from "@/lib/mood-picker-data"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessSelection } from "@/lib/wellnessFeedback"

const EMOJI_IMAGE_SIZE = 44
const CELL_GAP = 10

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
  const { width: screenW } = useWindowDimensions()
  const styles = useMemo(() => createStyles(W), [W])

  /** ~4 columns on typical phones; wraps visually via flexWrap in scroll content */
  const cellOuter =
    Math.min(84, Math.max(72, (screenW - 40 - CELL_GAP * 3) / 4))

  const selected = selectedMood !== null ? getMiloMoodItem(selectedMood) : undefined

  const onPick = useCallback(
    (value: number) => {
      wellnessSelection()
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
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
    <View style={styles.wrap}>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.sub}>
        {locale === "af" ?
          "Tik ’n emoji wat die beste pas — dit word vir jou stemming-streep gestoor."
        : "Tap the face that fits best — we’ll save it for your mood streak."}
      </Text>

      <View style={styles.gridWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.emojiRow}
        >
          {MILO_MOOD_ITEMS.map((m, i) => {
            const on = selectedMood === m.id
            const uri = moodNotoSvgUrlFromFamily(m.emojiFamily)
            const label = locale === "af" ? m.labelAf : m.label
            return (
              <Pressable
                key={m.id}
                onPress={() => onPick(m.id)}
                style={({ pressed }) => [
                  styles.cell,
                  {
                    width: cellOuter,
                    minHeight: cellOuter + 18,
                    marginRight: i === MILO_MOOD_ITEMS.length - 1 ? 0 : CELL_GAP,
                  },
                  on && styles.cellSelected,
                  pressed && styles.cellPressed,
                ]}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <View style={[styles.emojiWell, on && styles.emojiWellOn]}>
                  <Image
                    source={{ uri }}
                    style={{
                      width: EMOJI_IMAGE_SIZE,
                      height: EMOJI_IMAGE_SIZE,
                    }}
                    contentFit="contain"
                    cachePolicy="memory-disk"
                    transition={100}
                  />
                </View>
                <Text
                  style={[styles.cellLabel, on && styles.cellLabelOn]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {selected ?
        <View style={styles.confirm}>
          <Text style={styles.confirmMain}>
            {locale === "af" ?
              `Jy voel ${selected.labelAf.toLowerCase()}`
            : `You're feeling ${selected.label.toLowerCase()}`}
          </Text>
          <Text style={styles.confirmHint}>
            {locale === "af" ? selected.hintAf : selected.hint}
          </Text>
        </View>
      : null}
    </View>
  )
}

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    wrap: { marginTop: 0 },
    heading: {
      fontSize: 15,
      fontWeight: "700",
      color: W.text,
      textAlign: "center",
      marginBottom: 6,
    },
    sub: {
      fontSize: 12,
      color: W.textMuted,
      textAlign: "center",
      lineHeight: 17,
      marginBottom: 14,
      paddingHorizontal: 4,
    },
    gridWrap: { marginHorizontal: -4 },
    emojiRow: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "flex-start",
      paddingVertical: 4,
      paddingHorizontal: 4,
    },
    cell: {
      alignItems: "center",
      justifyContent: "flex-start",
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 18,
      backgroundColor: W.surfaceMuted,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    cellSelected: {
      backgroundColor: W.iconBg,
      borderColor: W.primary,
      borderWidth: 2,
    },
    cellPressed: { opacity: 0.9 },
    emojiWell: {
      width: EMOJI_IMAGE_SIZE + 16,
      height: EMOJI_IMAGE_SIZE + 16,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: W.bgElevated,
      marginBottom: 6,
    },
    emojiWellOn: {
      backgroundColor: W.bgElevated,
    },
    cellLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: W.textMuted,
      textAlign: "center",
    },
    cellLabelOn: {
      color: W.primary,
    },
    confirm: {
      marginTop: 14,
      paddingHorizontal: 8,
    },
    confirmMain: {
      fontSize: 14,
      fontWeight: "600",
      color: W.primary,
      textAlign: "center",
    },
    confirmHint: {
      fontSize: 12,
      color: W.textMuted,
      textAlign: "center",
      marginTop: 6,
      lineHeight: 17,
    },
  })
}
