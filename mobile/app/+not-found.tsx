import { Link, Stack } from "expo-router"
import { Pressable, StyleSheet, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { StatusBar } from "expo-status-bar"
import { Text } from "@/components/Themed"
import { inset, radiusMd } from "@/constants/layoutTokens"
import { useAppTheme } from "@/contexts/ThemeContext"

export default function NotFoundScreen() {
  const { colors, isDark } = useAppTheme()

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top", "bottom", "left", "right"]}>
        <View style={[styles.body, { paddingHorizontal: inset }]}>
          <Text style={[styles.title, { color: colors.text }]}>Page not found</Text>
          <Text style={[styles.bodyText, { color: colors.textMuted }]}>
            This link may be outdated or the screen was removed. Head back to your home view to continue.
          </Text>
          <Link href="/(tabs)" asChild>
            <Pressable
              style={({ pressed }) => [
                styles.cta,
                { backgroundColor: colors.primary, opacity: pressed ? 0.92 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go to home"
            >
              <Text style={styles.ctaText}>Back to home</Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    </>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  cta: {
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radiusMd,
    minWidth: 200,
    alignItems: "center",
  },
  ctaText: {
    color: "#F5F7FF",
    fontSize: 16,
    fontWeight: "600",
  },
})
