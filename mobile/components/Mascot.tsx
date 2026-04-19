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

/** Kind, approachable eyes — soft tone, slight oval (not sharp dots). */
function OpenEyes({
  W,
  state,
  size,
}: {
  W: WellnessPalette
  state: MascotState
  size: number
}) {
  const base = size * 0.085
  const w = base * (state === "encouraging" ? 1.06 : state === "proud" ? 1.04 : 1)
  const h = base * 0.88
  const gap = size * 0.09
  const fill = W.textMuted
  const r = Math.min(w, h) * 0.5
  return (
    <View style={[styles.eyeRow, { gap }]}>
      <View
        style={{
          width: w,
          height: h,
          borderRadius: r,
          backgroundColor: fill,
          opacity: 0.92,
        }}
      />
      <View
        style={{
          width: w,
          height: h,
          borderRadius: r,
          backgroundColor: fill,
          opacity: 0.92,
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
  const stroke = `${W.primary}99`
  const softStroke = `${W.textMuted}88`
  const mouthW =
    state === "celebrating" ? size * 0.34
    : state === "encouraging" ? size * 0.28
    : size * 0.26
  const borderW = state === "proud" || state === "celebrating" ? 2 : 1.75

  if (state === "sleepy") {
    return (
      <View
        style={{
          width: size * 0.2,
          height: size * 0.06,
          marginTop: size * 0.055,
          borderBottomWidth: 1.5,
          borderBottomLeftRadius: size * 0.08,
          borderBottomRightRadius: size * 0.08,
          borderColor: softStroke,
          opacity: 0.55,
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
          height: size * 0.1,
          marginTop: size * 0.045,
          borderBottomWidth: borderW,
          borderBottomLeftRadius: size * 0.12,
          borderBottomRightRadius: size * 0.12,
          borderColor:
            state === "celebrating" || state === "proud" ? stroke : softStroke,
          opacity: state === "supportive" ? 0.75 : 0.88,
        }}
      />
    </View>
  )
}

/** Soft resting eyes — short gentle curves, not flat harsh lines */
function SleepyFace({ W, size }: { W: WellnessPalette; size: number }) {
  const w = size * 0.14
  const h = 4
  const gap = size * 0.09
  const c = W.textMuted
  return (
    <View style={styles.face}>
      <View style={[styles.eyeRow, { gap }]}>
        <View
          style={{
            width: w,
            height: h,
            borderRadius: h / 2,
            backgroundColor: c,
            opacity: 0.42,
          }}
        />
        <View
          style={{
            width: w,
            height: h,
            borderRadius: h / 2,
            backgroundColor: c,
            opacity: 0.42,
          }}
        />
      </View>
      <Mouth W={W} state="sleepy" size={size} />
    </View>
  )
}

/** Calm, airy body gradient — no harsh saturation */
function bodyGradientColors(W: WellnessPalette): [string, string, string] {
  return [W.surfaceMuted, W.iconBg, `${W.primary}40`]
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
        withTiming(1.04, { duration: 420, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }),
      )
    } else {
      celebrate.value = withTiming(1, { duration: 280 })
    }
  }, [animated, celebrate, state])

  useEffect(() => {
    if (!animated || state === "sleepy") {
      blink.value = 1
      return
    }
    const cycle = 3800 / motion.blink
    blink.value = withRepeat(
      withSequence(
        withTiming(1, { duration: cycle * 0.9 }),
        withTiming(0.35, { duration: 90 }),
        withTiming(1, { duration: 110 }),
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

  const earSize = size * 0.17
  const bodyW = size
  const bodyH = size * 1.04
  const gradientColors = useMemo(() => bodyGradientColors(W), [W])

  const a11y = useMemo(
    () => mascotAccessibilityLabel(state, locale),
    [locale, state],
  )

  return (
    <View
      style={[styles.wrap, { width: bodyW + earSize * 0.45, minHeight: bodyH + earSize * 0.45 }, style]}
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
                top: earSize * 0.12,
                left: bodyW * 0.04,
                zIndex: 0,
                overflow: "hidden",
              },
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
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
                top: earSize * 0.12,
                right: bodyW * 0.04,
                zIndex: 0,
                overflow: "hidden",
              },
            ]}
          >
            <LinearGradient
              colors={gradientColors}
              locations={[0, 0.5, 1]}
              style={StyleSheet.absoluteFill}
              start={{ x: 0.15, y: 0 }}
              end={{ x: 0.85, y: 1 }}
            />
          </View>

          <LinearGradient
            colors={gradientColors}
            locations={[0, 0.42, 1]}
            start={{ x: 0.15, y: 0.1 }}
            end={{ x: 0.85, y: 0.95 }}
            style={[
              styles.body,
              {
                width: bodyW,
                height: bodyH,
                borderRadius: bodyW * 0.5,
                paddingTop: bodyH * 0.25,
                borderWidth: Platform.OS === "ios" ? StyleSheet.hairlineWidth : 1,
                borderColor: "rgba(255,255,255,0.05)",
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
    shadowColor: "#1a1025",
    shadowOpacity: 0.09,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
