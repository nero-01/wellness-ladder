import { Image } from "expo-image"
import { useEffect, useRef } from "react"
import { Animated, StyleSheet, Text, View } from "react-native"
import { radiusMd } from "@/constants/layoutTokens"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"
import { moodPastelAccent } from "@/lib/mood-pastels"

const STAR_NOTO = "1f31f"

type Props = {
  moodStreak: number
  bumpKey?: number
}

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: radiusMd,
      backgroundColor: W.iconBg,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    star: { width: 28, height: 28 },
    label: { fontSize: 15, fontWeight: "700", color: W.text },
    sub: { fontSize: 11, fontWeight: "600", color: W.textMuted, marginTop: 2 },
  })
}

export function MoodStreakBadge({ moodStreak, bumpKey = 0 }: Props) {
  const W = useWellnessColors()
  const styles = createStyles(W)
  const accent = moodPastelAccent(W.moodPastels, "softYellow")
  const scale = useRef(new Animated.Value(1)).current
  const prevBump = useRef(bumpKey)

  useEffect(() => {
    if (bumpKey > 0 && bumpKey !== prevBump.current) {
      prevBump.current = bumpKey
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.14,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [bumpKey, scale])

  const uri = emojiFamilySvgUrl(STAR_NOTO, "noto")

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View
        style={[
          styles.row,
          {
            backgroundColor: accent.idleFill,
            borderColor: accent.idleBorder,
          },
        ]}
        accessibilityRole="text"
      >
        <Image
          source={{ uri }}
          style={styles.star}
          contentFit="contain"
          cachePolicy="memory-disk"
          accessibilityLabel="Mood streak star"
        />
        <View>
          <Text style={styles.label}>{`Mood streak: ${moodStreak}`}</Text>
          <Text style={styles.sub}>check-ins in a row</Text>
        </View>
      </View>
    </Animated.View>
  )
}
