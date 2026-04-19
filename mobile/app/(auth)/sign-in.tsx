import { useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  ToastAndroid,
  View as RNView,
} from "react-native"
import * as Haptics from "expo-haptics"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Link, useRouter } from "expo-router"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { SafeAreaView } from "react-native-safe-area-context"
import { Text } from "@/components/Themed"
import { Mascot } from "@/components/Mascot"
import { FloatingLabelInput } from "@/components/auth/FloatingLabelInput"
import { useColorScheme } from "@/components/useColorScheme"
import { IS_DEV_BYPASS } from "@/constants/devBypass"
import { WellnessColors } from "@/constants/wellnessTheme"
import { useAuth } from "@/contexts/AuthContext"

export default function SignInScreen() {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const textPrimary = isDark ? "#f9fafb" : "#111827"
  const textMuted = isDark ? "#9ca3af" : "#6b7280"
  const border = isDark ? "#4b5563" : "#d1d5db"
  const inputBg = isDark ? "#252030" : "#ffffff"
  const labelFloat = isDark ? "#a78bfa" : WellnessColors.primary
  const labelInside = isDark ? "#9ca3af" : "#6b7280"

  const { signIn, signInWithDevBypass } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [bypassBusy, setBypassBusy] = useState(false)

  async function onSubmit() {
    setError(null)
    setLoading(true)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      await signIn(email.trim(), password)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setLoading(false)
    }
  }

  async function onDevBypass() {
    if (!IS_DEV_BYPASS) return
    setError(null)
    setBypassBusy(true)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      await signInWithDevBypass()
      // eslint-disable-next-line no-console
      console.log("[Dev bypass] active — navigating to task")
      router.replace("/(tabs)/task")
      if (Platform.OS === "android") {
        ToastAndroid.show("Dev bypass active", ToastAndroid.SHORT)
      } else {
        Alert.alert("Dev bypass", "Signed in — opening task tab.")
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Dev bypass failed")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setBypassBusy(false)
    }
  }

  const gradientColors = isDark
    ? (["#1e1033", "#0f172a", "#0c2e28"] as const)
    : (["#f3e8ff", "#ecfdf5", "#f8fafc"] as const)

  return (
    <LinearGradient colors={[...gradientColors]} style={styles.gradient}>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.kav}
          keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
        >
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid
            extraScrollHeight={Platform.OS === "ios" ? 24 : 48}
            contentContainerStyle={styles.scrollContent}
          >
            <RNView style={{ alignItems: "center", marginBottom: 12 }}>
              <Mascot state="encouraging" preset="auth" animated />
            </RNView>
            <Text style={[styles.hero, { color: textPrimary }]}>Sign in</Text>
            <Text style={[styles.sub, { color: textMuted }]}>
              Fields stay above the keyboard on iOS and Android.
            </Text>

            <RNView
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? "#1a1520" : "#ffffff",
                  borderWidth: isDark ? 1 : 0,
                  borderColor: isDark ? "#374151" : "transparent",
                },
              ]}
            >
              <FloatingLabelInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                autoFocus
                multiline={false}
                editable={!loading && !bypassBusy}
                borderColor={border}
                backgroundColor={inputBg}
                textColor={textPrimary}
                labelColorFloating={labelFloat}
                labelColorInside={labelInside}
                placeholderTextColor={labelInside}
              />
              <FloatingLabelInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPw}
                autoComplete="password"
                multiline={false}
                editable={!loading && !bypassBusy}
                borderColor={border}
                backgroundColor={inputBg}
                textColor={textPrimary}
                labelColorFloating={labelFloat}
                labelColorInside={labelInside}
                placeholderTextColor={labelInside}
                rightSlot={
                  <Pressable
                    onPress={() => setShowPw((s) => !s)}
                    hitSlop={12}
                    accessibilityLabel={showPw ? "Hide password" : "Show password"}
                  >
                    <Ionicons
                      name={showPw ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color="#6b7280"
                    />
                  </Pressable>
                }
              />

              <Text style={[styles.hint, { color: textMuted }]}>
                Use a Supabase JWT anon key (eyJ…) and a real user, or set
                EXPO_PUBLIC_USE_MOCK_AUTH=true for local mock login (see mobile/.env.example).
              </Text>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[
                  styles.button,
                  (loading || bypassBusy) && styles.buttonDisabled,
                ]}
                onPress={() => void onSubmit()}
                disabled={loading || bypassBusy}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign in</Text>
                )}
              </Pressable>

              {IS_DEV_BYPASS ? (
                <Pressable
                  style={[
                    styles.devBypassBtn,
                    {
                      borderColor: WellnessColors.primary,
                      opacity: bypassBusy || loading ? 0.65 : 1,
                    },
                  ]}
                  onPress={() => void onDevBypass()}
                  disabled={loading || bypassBusy}
                >
                  {bypassBusy ? (
                    <ActivityIndicator color={WellnessColors.primary} />
                  ) : (
                    <Text
                      style={[styles.devBypassText, { color: WellnessColors.primary }]}
                    >
                      🚀 Dev bypass login
                    </Text>
                  )}
                </Pressable>
              ) : null}
            </RNView>

            <Link href="/(auth)/sign-up" asChild>
              <Pressable style={styles.linkWrap}>
                <Text style={[styles.link, { color: WellnessColors.primary }]}>
                  Create an account
                </Text>
              </Pressable>
            </Link>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safe: { flex: 1, backgroundColor: "transparent" },
  kav: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 100,
    paddingTop: 8,
  },
  hero: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  sub: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 20,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  hint: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  error: { color: "#c00", marginTop: 8, fontSize: 14 },
  button: {
    backgroundColor: "#6b4d8a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  devBypassBtn: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  devBypassText: { fontWeight: "700", fontSize: 15 },
  linkWrap: { marginTop: 24, paddingVertical: 8 },
  link: { textAlign: "center", fontSize: 15, fontWeight: "600" },
})
