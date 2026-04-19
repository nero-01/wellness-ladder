import { Image } from "expo-image"
import { memo, useEffect, useMemo, useRef } from "react"
import { Platform, StyleSheet, View } from "react-native"
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated"
import type { MascotSizePreset } from "@/hooks/useMascotSize"
import { useMascotSize } from "@/hooks/useMascotSize"
import {
  MASCOT_MOTION,
  type MascotLocale,
  type MascotState,
  mascotAccessibilityLabel,
} from "@/components/MascotStates"

type MotionProfile = "default" | "calm"

type Props = {
  state: MascotState
  /** Explicit pixel size (wins over `preset`). */
  size?: number
  /** Responsive size when `size` is omitted. */
  preset?: MascotSizePreset
  animated?: boolean
  locale?: MascotLocale
  style?: object
  testID?: string
  /** Slower, softer motion (splash / loading / in-task companion). */
  motionProfile?: MotionProfile
  /** Increment to fire a one-shot gentle attention motion (e.g. task start). */
  attentionKey?: number
  /** Increment to fire a soft celebratory pop + glow (e.g. milestone, emphasis). */
  rewardKey?: number
}

/** Full-resolution PNG (RGB canvas). Avoids JPEG ringing/halos that read as a black edge around the blob. */
const COMPANION_ASSET = require("../assets/mascot/wellness-splash-companion.png")

/** Pixel dimensions of `wellness-splash-companion.png` — layout matches aspect so nothing letterboxes. */
const MASCOT_SRC_W = 1376
const MASCOT_SRC_H = 768
const MASCOT_ASPECT = MASCOT_SRC_W / MASCOT_SRC_H

const AnimatedView = Animated.createAnimatedComponent(View)

export const Mascot = memo(function Mascot({
  state,
  size: sizeProp,
  preset,
  animated = true,
  locale = "en",
  style,
  testID,
  motionProfile = "default",
  attentionKey,
  rewardKey,
}: Props) {
  const presetSize = useMascotSize(preset ?? "hero")
  /** Logical width of the mascot; height derived from asset aspect (no square letterboxing). */
  const size = sizeProp ?? (preset !== undefined ? presetSize : 172)
  const imgW = Math.round(size)
  const imgH = Math.round(size / MASCOT_ASPECT)
  const layoutMax = Math.max(imgW, imgH)

  const motion = MASCOT_MOTION[state]
  const calm = motionProfile === "calm"

  const floatY = useSharedValue(0)
  const sway = useSharedValue(0)
  const celebrate = useSharedValue(1)
  const sleepyDim = useSharedValue(1)
  const breathe = useSharedValue(1)
  const blinkY = useSharedValue(1)
  const nodY = useSharedValue(0)
  const proudPulse = useSharedValue(1)
  const attentionScale = useSharedValue(1)
  const attentionY = useSharedValue(0)
  const rewardScale = useSharedValue(1)

  const prevAttention = useRef<number | undefined>(undefined)
  const prevReward = useRef<number | undefined>(undefined)

  const amp = layoutMax * (calm ? 0.018 : 0.024) * motion.float
  const floatDuration = calm ? 4400 : 3600

  useEffect(() => {
    if (!animated) return
    floatY.value = withRepeat(
      withSequence(
        withTiming(-amp, { duration: floatDuration, easing: Easing.inOut(Easing.quad) }),
        withTiming(amp * 0.38, { duration: floatDuration, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      true,
    )
  }, [animated, amp, floatDuration, floatY])

  useEffect(() => {
    if (!animated) return
    const w =
      state === "encouraging" ? 0.014
      : state === "supportive" ? 0.01
      : state === "celebrating" ? 0.016
      : calm ? 0.006
      : 0.008
    const dur = calm ? 3000 : 2600
    sway.value = withRepeat(
      withSequence(
        withTiming(-w, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        withTiming(w, { duration: dur, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [animated, calm, state, sway])

  useEffect(() => {
    if (!animated) return
    if (state === "celebrating") {
      celebrate.value = withRepeat(
        withSequence(
          withTiming(1.065, { duration: 780, easing: Easing.inOut(Easing.quad) }),
          withTiming(1, { duration: 920, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        true,
      )
    } else {
      celebrate.value = withTiming(1, { duration: 300 })
    }
  }, [animated, celebrate, state])

  useEffect(() => {
    if (!animated) return
    sleepyDim.value = withTiming(state === "sleepy" ? 0.84 : 1, { duration: 420 })
  }, [animated, sleepyDim, state])

  useEffect(() => {
    if (!animated) return
    const br =
      state === "sleepy" ? 1.004
      : state === "celebrating" ? 1.008
      : 1.012
    const dur = state === "celebrating" ? 2600 : 2800
    breathe.value = withRepeat(
      withSequence(
        withTiming(br, { duration: dur, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: dur, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    )
  }, [animated, breathe, state])

  useEffect(() => {
    if (!animated || state === "sleepy") {
      blinkY.value = 1
      return
    }
    const gap = calm ? 5200 : 3800 / Math.max(0.45, motion.blink)
    blinkY.value = withRepeat(
      withSequence(
        withTiming(1, { duration: gap, easing: Easing.linear }),
        withTiming(0.91, { duration: 70, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 130, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    )
  }, [animated, blinkY, calm, motion.blink, state])

  useEffect(() => {
    if (!animated) return
    if (state === "encouraging") {
      nodY.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 2400, easing: Easing.inOut(Easing.quad) }),
          withTiming(-layoutMax * 0.035, { duration: 420, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 480, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      )
    } else {
      nodY.value = withTiming(0, { duration: 280 })
    }
  }, [animated, layoutMax, nodY, state])

  useEffect(() => {
    if (!animated) return
    if (state === "proud") {
      proudPulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.quad) }),
          withTiming(1.07, { duration: 420, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      )
    } else {
      proudPulse.value = withTiming(1, { duration: 240 })
    }
  }, [animated, proudPulse, state])

  useEffect(() => {
    if (attentionKey === undefined || attentionKey < 1) return
    if (prevAttention.current === attentionKey) return
    prevAttention.current = attentionKey
    if (!animated) return
    attentionScale.value = withSequence(
      withTiming(1.042, { duration: 240, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: 380, easing: Easing.inOut(Easing.quad) }),
    )
    attentionY.value = withSequence(
      withTiming(-layoutMax * 0.022, { duration: 240, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 380, easing: Easing.inOut(Easing.quad) }),
    )
  }, [animated, attentionKey, attentionScale, attentionY, layoutMax])

  useEffect(() => {
    if (rewardKey === undefined || rewardKey < 1) return
    if (prevReward.current === rewardKey) return
    prevReward.current = rewardKey
    if (!animated) return
    rewardScale.value = withSequence(
      withTiming(1.06, { duration: 280, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }),
    )
  }, [animated, rewardKey, rewardScale])

  /** Minimal room for float/scale — no extra box around the bitmap. */
  const padV = layoutMax * 0.04
  const padH = layoutMax * 0.03

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: floatY.value + nodY.value + attentionY.value },
      { rotate: `${sway.value}rad` },
      {
        scale:
          celebrate.value *
          breathe.value *
          proudPulse.value *
          attentionScale.value *
          rewardScale.value,
      },
    ],
    opacity: sleepyDim.value,
  }))

  const blinkStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: blinkY.value }],
  }))

  const a11y = useMemo(
    () => mascotAccessibilityLabel(state, locale),
    [locale, state],
  )

  return (
    <View
      style={[
        styles.wrap,
        {
          width: imgW + padH * 2,
          minHeight: imgH + padV * 2,
          paddingVertical: padV,
          paddingHorizontal: padH,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={a11y}
      testID={testID}
    >
      <View style={styles.stage} pointerEvents="none">
        <AnimatedView style={[styles.lift, bodyStyle]} collapsable={false}>
          <AnimatedView style={[blinkStyle, styles.imgFrame]} collapsable={false}>
            <Image
              source={COMPANION_ASSET}
              style={[
                styles.raster,
                {
                  width: imgW,
                  height: imgH,
                },
              ]}
              contentFit="contain"
              cachePolicy="memory-disk"
              transition={0}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            />
          </AnimatedView>
        </AnimatedView>
      </View>
    </View>
  )
})

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
  stage: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  lift: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  imgFrame: {
    backgroundColor: "transparent",
    borderWidth: 0,
    overflow: "visible",
  },
  raster: {
    backgroundColor: "transparent",
    borderWidth: 0,
    borderColor: "transparent",
    ...(Platform.OS === "android" ?
      {
        elevation: 0,
        renderToHardwareTextureAndroid: false,
      }
    : {}),
  },
})
