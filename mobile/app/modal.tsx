import { StatusBar } from "expo-status-bar"
import * as WebBrowser from "expo-web-browser"
import { Link } from "expo-router"
import { Platform, Pressable, StyleSheet, Text, View } from "react-native"
import { useWellnessColors } from "@/hooks/useWellnessColors"

const DOCS_URL = "https://docs.expo.dev/router/advanced/modals/"

export default function ModalScreen() {
  const W = useWellnessColors()

  return (
    <View style={[styles.container, { backgroundColor: W.bg }]}>
      <Text style={[styles.title, { color: W.text }]}>About this screen</Text>
      <Text style={[styles.body, { color: W.textMuted }]}>
        Modal route — useful for overlays and sheets. This project keeps the stack minimal.
      </Text>
      <Pressable
        onPress={() => {
          void WebBrowser.openBrowserAsync(DOCS_URL)
        }}
        accessibilityRole="link"
        accessibilityLabel="Open Expo modal documentation"
      >
        <Text style={[styles.link, { color: W.primary }]}>Expo Router modals →</Text>
      </Pressable>
      <Link href="/(tabs)" asChild>
        <Pressable style={styles.backWrap} accessibilityRole="button" accessibilityLabel="Close modal">
          <Text style={{ color: W.primary, fontWeight: "600" }}>Back to app</Text>
        </Pressable>
      </Link>
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
  link: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 24,
  },
  backWrap: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
})
