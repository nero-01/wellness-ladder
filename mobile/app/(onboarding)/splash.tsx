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
import { markOnboardingComplete } from "@/lib/onboarding-storage"
import { prepareBrandedBackdropFromSplash, skipOrFinishOnboarding } from "@/lib/onboarding-nav"
import { captureSplashPoster } from "@/lib/splash-poster"
import { resolveSplashGifSource } from "@/lib/splash-gif-source"

/** Matches Canva landing: https://canva.link/p2xky6a5cds17v9 */
const HEADLINE = "Bite-sized wellness"
const TAGLINE = "Simple wellness for busy lives"
const GIF_PALETTE = {
  /** Sampled from latest attached splash refs (lavender/periwinkle variant). */
  background: "#8E91EC",
  text: "#F1EFE5",
  textSecondary: "rgba(241, 239, 229, 0.9)",
  cta: "#5B6DDB",
  ctaPressed: "#5365D3",
  ctaText: "#F1EFE5",
  ctaBorder: "rgba(241, 239, 229, 0.24)",
  ctaShadow: "rgba(40, 50, 130, 0.36)",
}

export default function OnboardingSplashScreen() {
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
    // eslint-disable-next-line no-console
    console.log("[onboarding/splash] splash screen mounted")
    // eslint-disable-next-line no-console
    console.log("[theme/palette] GIF aligned colors", {
      background: GIF_PALETTE.background,
      primary: GIF_PALETTE.cta,
      text: GIF_PALETTE.text,
      textSecondary: GIF_PALETTE.textSecondary,
    })

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
    // eslint-disable-next-line no-console
    console.log("[onboarding/splash] GIF source:", gifSource)
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
      // eslint-disable-next-line no-console
      console.warn("[onboarding/splash] GIF failed to render, using static poster")
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
    // eslint-disable-next-line no-console
    console.log("[onboarding/splash] Get Started pressed")
    void goValue()
  }, [goValue])

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[GIF_PALETTE.background, GIF_PALETTE.background, GIF_PALETTE.background]}
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
      <View style={[styles.scrim, styles.layerOverlay]} pointerEvents="none" />
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
            <Text style={styles.skipText}>Skip</Text>
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
          <Text style={styles.appName}>{HEADLINE}</Text>
          <Text style={styles.tagline}>{TAGLINE}</Text>
        </View>
        <View style={[styles.bottomBlock, { paddingBottom: Math.max(insets.bottom + 20, 34) }]}>
          <Pressable
            onPress={onGetStarted}
            disabled={busy}
            style={({ pressed }) => [
              styles.primary,
              pressed && styles.primaryPressed,
              (pressed || busy) && { opacity: 0.9 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            {busy ? (
              <ActivityIndicator color={GIF_PALETTE.ctaText} />
            ) : (
              <Text style={styles.primaryText}>Get Started</Text>
            )}
          </Pressable>
          <View style={styles.loginRow}>
            <Text style={styles.loginLead}>Already have an account? </Text>
            <Pressable
              onPress={() => void onLoginHere()}
              disabled={busy}
              hitSlop={8}
              accessibilityRole="link"
              accessibilityLabel="Login here"
            >
              <Text style={styles.loginLink}>Login here</Text>
            </Pressable>
          </View>
        </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GIF_PALETTE.background },
  /** Behind full-screen GIF (GIF uses zIndex 0 in `gifLayoutStyle`). */
  layerGradient: { zIndex: -1 },
  layerOverlay: { zIndex: 2 },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28, 36, 92, 0.1)",
  },
  safe: { flex: 1, zIndex: 3 },
  topBar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    paddingTop: 6,
  },
  skipBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  skipText: {
    color: GIF_PALETTE.textSecondary,
    fontSize: 15,
    fontWeight: "600",
  },
  centerBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  appName: {
    color: GIF_PALETTE.text,
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  tagline: {
    marginTop: 12,
    color: GIF_PALETTE.textSecondary,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "500",
  },
  bottomBlock: {
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: "center",
  },
  primary: {
    backgroundColor: GIF_PALETTE.cta,
    paddingVertical: 16,
    paddingHorizontal: 44,
    borderRadius: 14,
    minWidth: 220,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: GIF_PALETTE.ctaBorder,
    shadowColor: GIF_PALETTE.ctaShadow,
    shadowOpacity: 0.7,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  primaryPressed: {
    backgroundColor: GIF_PALETTE.ctaPressed,
  },
  primaryText: {
    color: GIF_PALETTE.ctaText,
    fontSize: 17,
    fontWeight: "700",
  },
  loginRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    paddingHorizontal: 12,
  },
  loginLead: {
    color: GIF_PALETTE.textSecondary,
    fontSize: 15,
  },
  loginLink: {
    color: GIF_PALETTE.text,
    fontSize: 15,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
})
