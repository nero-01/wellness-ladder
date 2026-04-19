import { LinearGradient } from "expo-linear-gradient"
import { memo, useEffect, useMemo } from "react"
import { Platform, StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
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

const AnimatedView = Animated.createAnimatedComponent(View)

function OpenEyes({
  W,
  state,
  size,
}: {
  W: WellnessPalette
  state: MascotState
  size: number
}) {
  const eye = size * 0.09
  const gap = size * 0.08
  const scale = state === "encouraging" ? 1.15 : state === "proud" ? 1.08 : 1
  return (
    <View style={[styles.eyeRow, { gap }]}>
      <View
        style={{
          width: eye * scale,
          height: eye * scale,
          borderRadius: (eye * scale) / 2,
          backgroundColor: W.text,
        }}
      />
      <View
        style={{
          width: eye * scale,
          height: eye * scale,
          borderRadius: (eye * scale) / 2,
          backgroundColor: W.text,
        }}
      />
    </View>
  )
}

function Mouth({
  W,
  state,
  size,
}: {
  W: WellnessPalette
  state: MascotState
  size: number
}) {
  const faceMuted = W.textMuted
  const mouthW = state === "celebrating" ? size * 0.38 : size * 0.3
  const mouthBorder = state === "proud" ? 3 : 2.5
  const mouthColor =
    state === "celebrating" || state === "proud" ? W.primary : faceMuted

  if (state === "sleepy") {
    return (
      <View
        style={{
          width: size * 0.22,
          height: size * 0.08,
          marginTop: size * 0.06,
          borderBottomWidth: 2,
          borderBottomLeftRadius: size * 0.06,
          borderBottomRightRadius: size * 0.06,
          borderColor: faceMuted,
          opacity: 0.5,
        }}
      />
    )
  }

  return (
    <View
      style={{
        position: "relative",
        width: "100%",
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: mouthW,
          height: size * 0.12,
          marginTop: size * 0.05,
          borderBottomWidth: mouthBorder,
          borderBottomLeftRadius: size * 0.1,
          borderBottomRightRadius: size * 0.1,
          borderColor: mouthColor,
        }}
      />
      {state === "proud" ?
        <View
          style={{
            position: "absolute",
            top: -size * 0.1,
            right: size * 0.12,
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: W.primary,
            opacity: 0.95,
          }}
        />
      : null}
    </View>
  )
}

function SleepyFace({ W, size }: { W: WellnessPalette; size: number }) {
  const faceMuted = W.textMuted
  const eye = size * 0.09
  const gap = size * 0.08
  return (
    <View style={styles.face}>
      <View style={[styles.eyeRow, { gap }]}>
        <View
          style={{
            width: eye * 1.2,
            height: 3,
            backgroundColor: faceMuted,
            borderRadius: 2,
          }}
        />
        <View
          style={{
            width: eye * 1.2,
            height: 3,
            backgroundColor: faceMuted,
            borderRadius: 2,
          }}
        />
      </View>
      <Mouth W={W} state="sleepy" size={size} />
    </View>
  )
}

export const Mascot = memo(function Mascot({
  state,
  size = 112,
  animated = true,
  locale = "en",
  style,
  testID,
}: Props) {
  const W = useWellnessColors()
  const motion = MASCOT_MOTION[state]

  const floatY = useSharedValue(0)
  const sway = useSharedValue(0)
  const celebrate = useSharedValue(1)
  const blink = useSharedValue(1)

  const amp = size * 0.035 * motion.float

  useEffect(() => {
    if (!animated) return
    floatY.value = withRepeat(
      withSequence(
        withTiming(-amp, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
        withTiming(amp * 0.4, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    )
  }, [animated, amp, floatY])

  useEffect(() => {
    if (!animated) return
    const w =
      state === "encouraging" ? 0.04
      : state === "supportive" ? 0.025
      : state === "celebrating" ? 0.06
      : 0.02
    sway.value = withRepeat(
      withSequence(
        withTiming(-w, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(w, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [animated, state, sway])

  useEffect(() => {
    if (!animated) return
    if (state === "celebrating") {
      celebrate.value = withSequence(
        withTiming(1.1, { duration: 220, easing: Easing.out(Easing.back(1.2)) }),
        withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }),
      )
    } else {
      celebrate.value = withTiming(1, { duration: 200 })
    }
  }, [animated, celebrate, state])

  useEffect(() => {
    if (!animated || state === "sleepy") {
      blink.value = 1
      return
    }
    const cycle = 3200 / motion.blink
    blink.value = withRepeat(
      withSequence(
        withTiming(1, { duration: cycle * 0.88 }),
        withTiming(0.15, { duration: 70 }),
        withTiming(1, { duration: 90 }),
      ),
      -1,
      false,
    )
  }, [animated, blink, motion.blink, state])

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value },
      { rotate: `${sway.value}rad` },
      { scale: celebrate.value },
    ],
  }))

  const blinkStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: blink.value }],
  }))

  const earSize = size * 0.2
  const bodyW = size
  const bodyH = size * 1.05

  const a11y = useMemo(
    () => mascotAccessibilityLabel(state, locale),
    [locale, state],
  )

  const gradientColors = useMemo(
    () => [W.iconBg, W.logoBgTo] as [string, string],
    [W.iconBg, W.logoBgTo],
  )

  return (
    <View
      style={[styles.wrap, { width: bodyW + earSize * 0.5, minHeight: bodyH + earSize * 0.5 }, style]}
      accessibilityRole="image"
      accessibilityLabel={a11y}
      testID={testID}
    >
      <AnimatedView style={[styles.bodyLift, bodyStyle]}>
        <View style={{ width: bodyW, alignItems: "center" }}>
          <View
            style={[
              styles.ear,
              {
                position: "absolute",
                width: earSize,
                height: earSize,
                borderRadius: earSize / 2,
                top: earSize * 0.1,
                left: bodyW * 0.02,
                zIndex: 0,
                overflow: "hidden",
              },
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          <View
            style={[
              styles.ear,
              {
                position: "absolute",
                width: earSize,
                height: earSize,
                borderRadius: earSize / 2,
                top: earSize * 0.1,
                right: bodyW * 0.02,
                zIndex: 0,
                overflow: "hidden",
              },
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>

          <LinearGradient
            colors={gradientColors}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={[
              styles.body,
              {
                width: bodyW,
                height: bodyH,
                borderRadius: bodyW * 0.48,
                paddingTop: bodyH * 0.26,
                borderWidth: Platform.OS === "ios" ? StyleSheet.hairlineWidth : 1,
                borderColor: "rgba(255,255,255,0.06)",
              },
            ]}
          >
            {state === "sleepy" ?
              <SleepyFace W={W} size={bodyW} />
            : <View style={[styles.face, { position: "relative" }]}>
                <AnimatedView style={blinkStyle}>
                  <OpenEyes W={W} state={state} size={bodyW} />
                </AnimatedView>
                <Mouth W={W} state={state} size={bodyW} />
              </View>
            }
          </LinearGradient>
        </View>
      </AnimatedView>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  bodyLift: {
    alignItems: "center",
    justifyContent: "center",
  },
  ear: {},
  body: {
    alignItems: "center",
    zIndex: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  face: {
    alignItems: "center",
    width: "100%",
  },
  eyeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
})
