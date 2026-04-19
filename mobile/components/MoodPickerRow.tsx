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
import { moodPastelAccent } from "@/lib/mood-pastels"
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

  const cellOuter =
    Math.min(84, Math.max(72, (screenW - 40 - CELL_GAP * 3) / 4))

  const selected = selectedMood !== null ? getMiloMoodItem(selectedMood) : undefined
  const selectedAccent = selected
    ? moodPastelAccent(W.moodPastels, selected.pastelKey)
    : null

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
            const accent = moodPastelAccent(W.moodPastels, m.pastelKey)
            return (
              <Pressable
                key={m.id}
                onPress={() => onPick(m.id)}
                style={({ pressed }) => [
                  styles.cellBase,
                  {
                    width: cellOuter,
                    minHeight: cellOuter + 18,
                    marginRight: i === MILO_MOOD_ITEMS.length - 1 ? 0 : CELL_GAP,
                    backgroundColor: on ? accent.fill : accent.idleFill,
                    borderColor: on ? accent.border : accent.idleBorder,
                    borderWidth: on ? 2 : 1,
                  },
                  pressed && styles.cellPressed,
                ]}
                accessibilityLabel={label}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
              >
                <View
                  style={[
                    styles.emojiWell,
                    {
                      backgroundColor: on ? accent.fill : W.bgElevated,
                      borderWidth: 1,
                      borderColor: on ? accent.border : W.cardBorder,
                    },
                  ]}
                >
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
                  style={[
                    styles.cellLabel,
                    on ? { color: accent.label } : { color: W.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {selected && selectedAccent ?
        <View
          style={[
            styles.confirm,
            {
              borderLeftWidth: 4,
              borderLeftColor: selectedAccent.border,
              paddingLeft: 12,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: selectedAccent.fill,
            },
          ]}
        >
          <Text style={[styles.confirmMain, { color: selectedAccent.label }]}>
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
    /** Layout only — mood color comes from accent tokens */
    cellBase: {
      alignItems: "center",
      justifyContent: "flex-start",
      paddingVertical: 10,
      paddingHorizontal: 6,
      borderRadius: 18,
    },
    cellPressed: { opacity: 0.92 },
    emojiWell: {
      width: EMOJI_IMAGE_SIZE + 16,
      height: EMOJI_IMAGE_SIZE + 16,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 6,
    },
    cellLabel: {
      fontSize: 10,
      fontWeight: "700",
      textAlign: "center",
    },
    confirm: {
      marginTop: 14,
      paddingHorizontal: 4,
    },
    confirmMain: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "left",
    },
    confirmHint: {
      fontSize: 12,
      color: W.textMuted,
      textAlign: "left",
      marginTop: 6,
      lineHeight: 17,
    },
  })
}
