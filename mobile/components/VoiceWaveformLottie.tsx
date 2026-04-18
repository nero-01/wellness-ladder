import { useEffect, useRef } from "react"
import { Animated, StyleSheet, View } from "react-native"

/**
 * Voice “waveform” motion while guidance audio plays.
 * Lightweight RN Animated bars (no client ElevenLabs key); pairs with `useTaskVoiceGuidance` + `guidanceTts`.
 */
export function VoiceWaveformLottie({
  active,
  color,
  height = 44,
}: {
  active: boolean
  color: string
  height?: number
}) {
  const n = 7
  const values = useRef(Array.from({ length: n }, () => new Animated.Value(0.2))).current

  useEffect(() => {
    if (!active) {
      values.forEach((v) => v.setValue(0.15))
      return
    }
    const loops = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, {
            toValue: 1,
            duration: 320 + i * 35,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.2,
            duration: 320 + i * 35,
            useNativeDriver: true,
          }),
        ]),
      ),
    )
    const timers = loops.map((loop, i) =>
      setTimeout(() => loop.start(), i * 80),
    )
    return () => {
      loops.forEach((l) => l.stop())
      timers.forEach(clearTimeout)
    }
  }, [active, values])

  return (
    <View style={[styles.row, { height }]} accessibilityLabel="Voice activity">
      {values.map((v, i) => (
        <Animated.View
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          style={[
            styles.bar,
            i > 0 ? styles.barGap : null,
            {
              backgroundColor: color,
              transform: [{ scaleY: v }],
            },
          ]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  bar: {
    width: 5,
    height: 36,
    borderRadius: 3,
  },
  barGap: { marginLeft: 5 },
})
