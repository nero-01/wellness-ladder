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
import { Link, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { SafeAreaView } from "react-native-safe-area-context"
import { BrandedScreenBackdrop } from "@/components/BrandedScreenBackdrop"
import { Text } from "@/components/Themed"
import { FloatingLabelInput } from "@/components/auth/FloatingLabelInput"
import { IS_DEV_BYPASS } from "@/constants/devBypass"
import { radiusLg, radiusSm } from "@/constants/layoutTokens"
import { isSupabaseConfigured } from "@/lib/supabase"
import {
  wellnessCardInner,
  wellnessCardOuter,
} from "@/constants/wellnessSurface"
import { useAuth } from "@/contexts/AuthContext"
import { useAppTheme } from "@/contexts/ThemeContext"
import { useWellnessColors } from "@/hooks/useWellnessColors"

export default function SignInScreen() {
  const router = useRouter()
  const { isDark } = useAppTheme()
  const W = useWellnessColors()
  const textPrimary = W.text
  const textMuted = W.textMuted
  const border = W.cardBorder
  const inputBg = isDark ? "#252030" : "#ffffff"
  const labelFloat = W.primary
  const labelInside = textMuted

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
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log("[Dev bypass] active — navigating to task")
      }
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

  return (
    <BrandedScreenBackdrop style={styles.fill}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
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
            <Text style={[styles.hero, { color: textPrimary }]}>Sign in</Text>
            <Text style={[styles.sub, { color: textMuted }]}>
              Welcome back. Continue your daily wellness ladder.
            </Text>

            <RNView style={[wellnessCardOuter(radiusLg), { alignSelf: "stretch" }]}>
              <RNView
                style={[
                  wellnessCardInner(W, radiusLg, {
                    backgroundColor: isDark ? "#1a1520" : "#ffffff",
                    borderColor: isDark ? "#374151" : W.cardBorder,
                  }),
                  { padding: 20 },
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
                      color={textMuted}
                    />
                  </Pressable>
                }
              />

              {__DEV__ ? (
                <Text style={[styles.hint, { color: textMuted }]}>
                  Dev: use a Supabase anon JWT and a real user, or set EXPO_PUBLIC_USE_MOCK_AUTH=true
                  (see mobile/.env.example).
                </Text>
              ) : isSupabaseConfigured() ? (
                <Text style={[styles.hint, { color: textMuted }]}>
                  Use the email and password you registered with.
                </Text>
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[
                  styles.button,
                  { backgroundColor: W.primary },
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
                      borderColor: W.primary,
                      opacity: bypassBusy || loading ? 0.65 : 1,
                    },
                  ]}
                  onPress={() => void onDevBypass()}
                  disabled={loading || bypassBusy}
                >
                  {bypassBusy ? (
                    <ActivityIndicator color={W.primary} />
                  ) : (
                    <Text
                      style={[styles.devBypassText, { color: W.primary }]}
                    >
                      🚀 Dev bypass login
                    </Text>
                  )}
                </Pressable>
              ) : null}
              </RNView>
            </RNView>

            <Link href="/(auth)/sign-up" asChild>
              <Pressable style={styles.linkWrap}>
                <Text style={[styles.link, { color: W.primary }]}>
                  Create an account
                </Text>
              </Pressable>
            </Link>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BrandedScreenBackdrop>
  )
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
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
  hint: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  error: { color: "#c00", marginTop: 8, fontSize: 14 },
  button: {
    padding: 16,
    borderRadius: radiusSm,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  devBypassBtn: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radiusSm,
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  devBypassText: { fontWeight: "700", fontSize: 15 },
  linkWrap: { marginTop: 24, paddingVertical: 8 },
  link: { textAlign: "center", fontSize: 15, fontWeight: "600" },
})
