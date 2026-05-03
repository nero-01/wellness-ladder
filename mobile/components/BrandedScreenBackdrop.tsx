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
import { useBrandedBackdrop } from "@/contexts/BrandedBackdropContext"
import { useAppTheme } from "@/contexts/ThemeContext"
import { SPLASH_GIF_MODULE } from "@/lib/splash-gif-source"

type Props = {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * Full-screen blurred still from the splash video + scrim so foreground UI stays readable.
 */
export function BrandedScreenBackdrop({ children, style }: Props) {
  const { isDark, backgroundLight, backgroundDark, backdropOverlay } =
    useAppTheme()
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
    outputRange: [1, 1.012],
  })

  if (!imageUri) {
    return (
      <View
        style={[
          styles.fill,
          { backgroundColor: isDark ? backgroundDark : backgroundLight },
          style,
        ]}
      >
        {children}
      </View>
    )
  }

  return (
    <View
      style={[
        styles.fill,
        { backgroundColor: isDark ? backgroundDark : backgroundLight },
        style,
      ]}
    >
      <View style={[StyleSheet.absoluteFill, styles.clip]} pointerEvents="none">
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ scale: imageScale }] },
          ]}
        >
          <Image
            source={imageUri ? { uri: imageUri } : SPLASH_GIF_MODULE}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            contentPosition="center"
            transition={0}
            cachePolicy="memory-disk"
            accessibilityIgnoresInvertColors
          />
        </Animated.View>
      </View>
      <BlurView
        intensity={isDark ? 16 : 11}
        tint={isDark ? "dark" : "light"}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View
        style={[StyleSheet.absoluteFill, { backgroundColor: backdropOverlay }]}
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
