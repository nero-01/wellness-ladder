import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, useRouter } from "expo-router"
import { Image, type ImageSource } from "expo-image"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import { useBrandedBackdrop } from "@/contexts/BrandedBackdropContext"
import { useAppTheme } from "@/contexts/ThemeContext"
import { markOnboardingComplete } from "@/lib/onboarding-storage"
import { prepareBrandedBackdropFromSplash, skipOrFinishOnboarding } from "@/lib/onboarding-nav"
import { captureSplashPoster } from "@/lib/splash-poster"
import { resolveSplashGifSource } from "@/lib/splash-gif-source"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { gapSection, inset, radiusMd } from "@/constants/layoutTokens"

/** Matches Canva landing: https://canva.link/p2xky6a5cds17v9 */
const HEADLINE = "Bite-sized wellness"
const TAGLINE = "Simple steps for a better life"
export default function OnboardingSplashScreen() {
  const { isDark, backgroundLight, backgroundDark, backdropOverlay } =
    useAppTheme()
  const W = useWellnessColors()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { tour } = useLocalSearchParams<{ tour?: string }>()
  const tourOnly = tour === "1"
  const { user, continueAsGuest } = useAuth()
  const { setBrandedImageUri } = useBrandedBackdrop()
  const mountedLogged = useRef(false)
  const sourceReadyLogged = useRef(false)
  const riseY = useRef(new Animated.Value(56)).current
  const riseOpacity = useRef(new Animated.Value(0)).current
  const [busy, setBusy] = useState(false)
  const [gifSource, setGifSource] = useState<ImageSource | number | null>(
    null,
  )
  /** Fallback still if GIF decode fails on device. */
  const [staticPreviewUri, setStaticPreviewUri] = useState<string | null>(null)
  const splashPalette = useMemo(
    () => ({
      background: W.bg,
      text: W.text,
      textSecondary: W.textMuted,
      cta: W.primary,
      ctaPressed: W.primaryPressed,
      ctaText: "#F5F7FF",
      ctaBorder: W.cardBorder,
      ctaShadow: "rgba(40, 50, 130, 0.36)",
    }),
    [W],
  )

  useEffect(() => {
    let cancelled = false
    void resolveSplashGifSource().then((src) => {
      if (!cancelled) setGifSource(src)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (mountedLogged.current) return
    mountedLogged.current = true
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[onboarding/splash] splash screen mounted")
      // eslint-disable-next-line no-console
      console.log("[theme/palette] GIF aligned colors", {
        background: splashPalette.background,
        primary: splashPalette.cta,
        text: splashPalette.text,
        textSecondary: splashPalette.textSecondary,
      })
    }

    Animated.parallel([
      Animated.timing(riseY, {
        toValue: 0,
        duration: 580,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(riseOpacity, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  useEffect(() => {
    if (gifSource == null || sourceReadyLogged.current) return
    sourceReadyLogged.current = true
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[onboarding/splash] GIF source:", gifSource)
    }
  }, [gifSource])

  useEffect(() => {
    if (gifSource != null) return
    const t = setTimeout(() => {
      void (async () => {
        const uri = await captureSplashPoster()
        if (uri) {
          setStaticPreviewUri(uri)
          await setBrandedImageUri(uri)
        }
      })()
    }, 2200)
    return () => clearTimeout(t)
  }, [gifSource, setBrandedImageUri])

  const onGifError = useCallback(
    async () => {
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("[onboarding/splash] GIF failed to render, using static poster")
      }
      const uri = await captureSplashPoster()
      if (uri) {
        setStaticPreviewUri(uri)
        await setBrandedImageUri(uri)
      }
    },
    [setBrandedImageUri],
  )

  const onGifLoaded = useCallback(async () => {
    const uri = await captureSplashPoster()
    if (uri) {
      await setBrandedImageUri(uri)
    }
  }, [setBrandedImageUri])

  const gifLayoutStyle = useMemo(
    () => ({
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    }),
    [],
  )

  const goValue = useCallback(async () => {
    setBusy(true)
    try {
      await prepareBrandedBackdropFromSplash(
        setBrandedImageUri,
      )
      router.push({
        pathname: "/(onboarding)/value",
        params: tourOnly ? { tour: "1" } : {},
      })
    } finally {
      setBusy(false)
    }
  }, [router, setBrandedImageUri, tourOnly])

  const onSkip = useCallback(async () => {
    setBusy(true)
    try {
      await skipOrFinishOnboarding(router, {
        user,
        continueAsGuest,
        setBrandedImageUri,
        videoDurationMs: null,
      })
    } finally {
      setBusy(false)
    }
  }, [router, user, continueAsGuest, setBrandedImageUri])

  const onLoginHere = useCallback(async () => {
    setBusy(true)
    try {
      await markOnboardingComplete()
      router.replace("/(auth)/sign-in")
    } finally {
      setBusy(false)
    }
  }, [router])

  const onGetStarted = useCallback(() => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.log("[onboarding/splash] Get Started pressed")
    }
    void goValue()
  }, [goValue])

  return (
    <View style={styles.root}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={[
          isDark ? backgroundDark : backgroundLight,
          isDark ? backgroundDark : backgroundLight,
          isDark ? backgroundDark : backgroundLight,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, styles.layerGradient]}
        pointerEvents="none"
      />
      {gifSource != null ? (
        <Image
          source={gifSource}
          style={gifLayoutStyle}
          contentFit="cover"
          pointerEvents="none"
          transition={0}
          accessibilityIgnoresInvertColors
          onLoad={onGifLoaded}
          onError={onGifError}
        />
      ) : null}
      {gifSource == null && staticPreviewUri != null ? (
        <Image
          source={{ uri: staticPreviewUri }}
          style={gifLayoutStyle}
          contentFit="cover"
          pointerEvents="none"
          accessibilityIgnoresInvertColors
        />
      ) : null}
      <View
        style={[styles.scrim, styles.layerOverlay, { backgroundColor: backdropOverlay }]}
        pointerEvents="none"
      />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => void onSkip()}
            hitSlop={16}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            style={({ pressed }) => [styles.skipBtn, pressed && { opacity: 0.75 }]}
          >
            <Text style={[styles.skipText, { color: splashPalette.textSecondary }]}>Skip</Text>
          </Pressable>
        </View>
        <Animated.View
          style={{
            flex: 1,
            opacity: riseOpacity,
            transform: [{ translateY: riseY }],
          }}
          pointerEvents="auto"
        >
        <View style={styles.centerBlock} pointerEvents="box-none">
          <Text style={[styles.appName, { color: splashPalette.text }]}>{HEADLINE}</Text>
          <Text style={[styles.tagline, { color: splashPalette.textSecondary }]}>{TAGLINE}</Text>
        </View>
        <View style={[styles.bottomBlock, { paddingBottom: Math.max(insets.bottom + 20, 34) }]}>
          <Pressable
            onPress={onGetStarted}
            disabled={busy}
            style={({ pressed }) => [
              styles.primary,
              {
                backgroundColor: splashPalette.cta,
                borderColor: splashPalette.ctaBorder,
              },
              pressed && styles.primaryPressed,
              (pressed || busy) && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            {busy ? (
              <ActivityIndicator color={splashPalette.ctaText} />
            ) : (
              <Text style={[styles.primaryText, { color: splashPalette.ctaText }]}>Get Started</Text>
            )}
          </Pressable>
          <View style={styles.loginRow}>
            <Text style={[styles.loginLead, { color: splashPalette.textSecondary }]}>Already have an account? </Text>
            <Pressable
              onPress={() => void onLoginHere()}
              disabled={busy}
              hitSlop={8}
              accessibilityRole="link"
              accessibilityLabel="Login here"
            >
              <Text style={[styles.loginLink, { color: splashPalette.text }]}>Login here</Text>
            </Pressable>
          </View>
        </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  /** Behind full-screen GIF (GIF uses zIndex 0 in `gifLayoutStyle`). */
  layerGradient: { zIndex: -1 },
  layerOverlay: { zIndex: 2 },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  safe: { flex: 1, zIndex: 3 },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: inset,
    paddingTop: 8,
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  skipText: {
    fontSize: 15,
    fontWeight: "600",
  },
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: inset,
  },
  appName: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.2,
  },
  tagline: {
    marginTop: gapSection,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "500",
  },
  bottomBlock: {
    paddingHorizontal: inset,
    paddingBottom: 28,
    alignItems: "center",
  },
  primary: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: radiusMd,
    minWidth: 220,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#0B0D1A",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryPressed: {
    opacity: 0.92,
  },
  primaryText: {
    fontSize: 17,
    fontWeight: "700",
  },
  loginRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: gapSection + 2,
    paddingHorizontal: gapSection,
  },
  loginLead: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
})
