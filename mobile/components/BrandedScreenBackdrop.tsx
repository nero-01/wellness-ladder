import { BlurView } from "expo-blur"
import { Image } from "expo-image"
import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import {
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { useColorScheme } from "@/components/useColorScheme"
import { useBrandedBackdrop } from "@/contexts/BrandedBackdropContext"
import { WellnessColors, WellnessColorsLight } from "@/constants/wellnessTheme"

type Props = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * Full-screen blurred still from the splash video + scrim so foreground UI stays readable.
 */
export function BrandedScreenBackdrop({ children, style }: Props) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const W = isDark ? WellnessColors : WellnessColorsLight
  const { imageUri } = useBrandedBackdrop()
  const breathe = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (!imageUri) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 5200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 5200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [imageUri, breathe])

  const imageScale = breathe.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.035],
  })

  if (!imageUri) {
    return <View style={[styles.fill, { backgroundColor: W.bg }, style]}>{children}</View>
  }

  const scrim = isDark ? "rgba(36, 47, 120, 0.2)" : "rgba(36, 47, 120, 0.16)"

  return (
    <View style={[styles.fill, style]}>
      <View style={[styles.fill, styles.clip]} pointerEvents="none">
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ scale: imageScale }] },
          ]}
        >
          <Image
            source={{ uri: imageUri }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </View>
      <BlurView
        intensity={isDark ? 34 : 30}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: scrim }]}
        pointerEvents="none"
      />
      <View style={styles.foreground}>{children}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  clip: { overflow: "hidden" },
  foreground: { flex: 1, backgroundColor: "transparent" },
})
