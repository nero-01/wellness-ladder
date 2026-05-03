import { StatusBar } from "expo-status-bar"
import * as WebBrowser from "expo-web-browser"
import { Link } from "expo-router"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useAppTheme } from "@/contexts/ThemeContext"
import { inset, radiusMd, spaceLg, spaceSm, spaceXl } from "@/constants/layoutTokens"
import { useWellnessColors } from "@/hooks/useWellnessColors"

const DOCS_URL = "https://docs.expo.dev/router/advanced/modals/"

export default function ModalScreen() {
  const W = useWellnessColors()
  const { isDark } = useAppTheme()

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: W.bg }]} edges={["top", "bottom", "left", "right"]}>
      <View style={[styles.container, { paddingHorizontal: inset }]}>
        <Text style={[styles.title, { color: W.text }]}>Modal</Text>
        <Text style={[styles.body, { color: W.textMuted }]}>
          Full-screen overlay routes are useful for focused flows (settings sheets, confirmations).
          This stack keeps modals minimal so the main ladder stays calm.
        </Text>
        <Pressable
          onPress={() => {
            void WebBrowser.openBrowserAsync(DOCS_URL)
          }}
          accessibilityRole="link"
          accessibilityLabel="Open Expo modal documentation"
          style={({ pressed }) => [pressed && { opacity: 0.85 }]}
        >
          <Text style={[styles.link, { color: W.primary }]}>Expo Router modals →</Text>
        </Pressable>
        <Link href="/(tabs)" asChild>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: W.primary, opacity: pressed ? 0.92 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          >
            <Text style={styles.primaryBtnText}>Back to app</Text>
          </Pressable>
        </Link>
      </View>
      <StatusBar style={isDark ? "light" : "dark"} />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spaceLg,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: spaceSm,
  },
  link: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: spaceXl,
  },
  primaryBtn: {
    paddingVertical: 14,
    paddingHorizontal: spaceXl + spaceLg,
    borderRadius: radiusMd,
    minWidth: 200,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#F5F7FF",
    fontSize: 16,
    fontWeight: "700",
  },
})
