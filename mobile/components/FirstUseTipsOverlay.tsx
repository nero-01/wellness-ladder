import { useCallback, useEffect, useRef, useState } from "react"
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useAuth } from "@/contexts/AuthContext"
import {
  getFirstUseTipsDismissed,
  markFirstUseTipsDismissed,
} from "@/lib/onboarding-storage"

const AUTO_DISMISS_MS = 11_000

const TIPS = [
  "Tap Task to start your daily bite.",
  "Swipe mood chips as you move through steps.",
  "Open Progress for streaks — replay the tour from How to start anytime.",
]

export function FirstUseTipsOverlay() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const [visible, setVisible] = useState(false)
  const opacity = useRef(new Animated.Value(0)).current
  const dismissedRef = useRef(false)

  const fadeOut = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    Animated.timing(opacity, {
      toValue: 0,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false)
      void markFirstUseTipsDismissed()
    })
  }, [opacity])

  useEffect(() => {
    dismissedRef.current = false
    if (!user) return
    let cancelled = false
    void (async () => {
      const done = await getFirstUseTipsDismissed()
      if (cancelled || done) return
      setVisible(true)
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        useNativeDriver: true,
      }).start()
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    if (!visible) return
    const t = setTimeout(() => fadeOut(), AUTO_DISMISS_MS)
    return () => clearTimeout(t)
  }, [visible, fadeOut])

  if (!visible) return null

  return (
    <View
      style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 12) + 56 }]}
      pointerEvents="box-none"
    >
      <Animated.View style={[styles.card, { opacity }]}>
        <Text style={styles.title}>Quick tips</Text>
        {TIPS.map((t) => (
          <Text key={t} style={styles.line}>
            {"\u2022"} {t}
          </Text>
        ))}
        <Pressable
          onPress={fadeOut}
          style={styles.dismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss tips"
        >
          <Text style={styles.dismissText}>Tap to dismiss</Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    alignItems: "stretch",
  },
  card: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "rgba(21, 17, 24, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  title: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 8,
  },
  line: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 6,
  },
  dismiss: {
    marginTop: 8,
    alignSelf: "flex-end",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  dismissText: {
    color: "rgba(196, 181, 253, 0.95)",
    fontSize: 13,
    fontWeight: "700",
  },
})
