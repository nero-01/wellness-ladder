import { Image } from "expo-image"
import { memo, useEffect, useMemo } from "react"
import { StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import {
  MASCOT_MOTION,
  type MascotLocale,
  type MascotState,
  mascotAccessibilityLabel,
} from "@/components/MascotStates"

type Props = {
  state: MascotState
  size?: number
  animated?: boolean
  locale?: MascotLocale
  style?: object
  testID?: string
}

/** Official wellness companion art (single source of truth for in-app mascot). */
const COMPANION_ASSET = require("../assets/mascot/companion-official.png")

const AnimatedView = Animated.createAnimatedComponent(View)

export const Mascot = memo(function Mascot({
  state,
  size = 112,
  animated = true,
  locale = "en",
  style,
  testID,
}: Props) {
  const motion = MASCOT_MOTION[state]

  const floatY = useSharedValue(0)
  const sway = useSharedValue(0)
  const celebrate = useSharedValue(1)
  const sleepyDim = useSharedValue(1)

  const amp = size * 0.022 * motion.float

  useEffect(() => {
    if (!animated) return
    floatY.value = withRepeat(
      withSequence(
        withTiming(-amp, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
        withTiming(amp * 0.35, { duration: 3600, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    )
  }, [animated, amp, floatY])

  useEffect(() => {
    if (!animated) return
    const w =
      state === "encouraging" ? 0.014
      : state === "supportive" ? 0.01
      : state === "celebrating" ? 0.018
      : 0.008
    sway.value = withRepeat(
      withSequence(
        withTiming(-w, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
        withTiming(w, { duration: 2600, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [animated, state, sway])

  useEffect(() => {
    if (!animated) return
    if (state === "celebrating") {
      celebrate.value = withSequence(
        withTiming(1.06, { duration: 420, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }),
      )
    } else {
      celebrate.value = withTiming(1, { duration: 280 })
    }
  }, [animated, celebrate, state])

  useEffect(() => {
    if (!animated) return
    sleepyDim.value = withTiming(state === "sleepy" ? 0.82 : 1, { duration: 380 })
  }, [animated, sleepyDim, state])

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${sway.value}rad` },
      { scale: celebrate.value },
    ],
    opacity: sleepyDim.value,
  }))

  const a11y = useMemo(
    () => mascotAccessibilityLabel(state, locale),
    [locale, state],
  )

  return (
    <View
      style={[styles.wrap, { width: size, height: size }, style]}
      accessibilityRole="image"
      accessibilityLabel={a11y}
      testID={testID}
    >
      <AnimatedView style={[styles.lift, bodyStyle]}>
        <Image
          source={COMPANION_ASSET}
          style={{ width: size, height: size }}
          contentFit="contain"
          cachePolicy="memory-disk"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        />
      </AnimatedView>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  lift: {
    alignItems: "center",
    justifyContent: "center",
  },
})
