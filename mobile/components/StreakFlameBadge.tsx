import { Image } from "expo-image"
import { useEffect, useRef, useState } from "react"
import { Animated, StyleSheet, Text, View } from "react-native"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"

const FLAME_NOTO = "1f525"

type Props = {
  /** Current consecutive streak count (before or after today’s completion). */
  streakCount: number
  /** When this increments, plays a short +1 pop. */
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
      borderRadius: 16,
      backgroundColor: W.iconBg,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    flame: { width: 28, height: 28 },
    label: { fontSize: 15, fontWeight: "700", color: W.text },
    sub: { fontSize: 11, fontWeight: "600", color: W.textMuted, marginTop: 2 },
  })
}

export function StreakFlameBadge({ streakCount, bumpKey = 0 }: Props) {
  const W = useWellnessColors()
  const styles = createStyles(W)
  const scale = useRef(new Animated.Value(1)).current
  const prevBump = useRef(bumpKey)

  useEffect(() => {
    if (bumpKey > 0 && bumpKey !== prevBump.current) {
      prevBump.current = bumpKey
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.18,
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

  const uri = emojiFamilySvgUrl(FLAME_NOTO, "noto")

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <View style={styles.row} accessibilityRole="text">
        <Image
          source={{ uri }}
          style={styles.flame}
          contentFit="contain"
          cachePolicy="memory-disk"
          accessibilityLabel="Streak flame"
        />
        <View>
          <Text style={styles.label}>{`Streak: ${streakCount}`}</Text>
          <Text style={styles.sub}>days in a row</Text>
        </View>
      </View>
    </Animated.View>
  )
}
