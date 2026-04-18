import type { ComponentProps } from "react"
import { useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View as RNView,
} from "react-native"
import { FontAwesome5 } from "@expo/vector-icons"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Link } from "expo-router"
import { SafeAreaView } from "react-native-safe-area-context"
import { Text } from "@/components/Themed"
import { useColorScheme } from "@/components/useColorScheme"
import { AUTH_PLACEHOLDER, authInputStyles } from "@/constants/authFormStyles"
import type { OAuthProviderId } from "@/contexts/AuthContext"
import { useAuth } from "@/contexts/AuthContext"
import {
  clearEmailConfirmationCooldown,
  formatCooldownWait,
  getSignupCooldownRemainingMs,
  getStoredPendingConfirmationEmail,
  recordEmailConfirmationSent,
} from "@/lib/email-signup-cooldown"
import { isPlausibleMailbox, sanitizeAuthEmailForSupabase } from "@/lib/auth-email"
import { WellnessColors } from "@/constants/wellnessTheme"

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("Auth [SignUp] module loaded — Expo / Supabase (no Clerk)")
}

type FaBrand = ComponentProps<typeof FontAwesome5>["name"]

const SOCIAL: {
  id: OAuthProviderId
  label: string
  icon: FaBrand
  color: string
}[] = [
  { id: "google", label: "Google", icon: "google", color: "#4285F4" },
  { id: "facebook", label: "Facebook", icon: "facebook", color: "#1877F2" },
  { id: "twitter", label: "X", icon: "twitter", color: "#111827" },
]

function passwordStrongEnough(p: string): boolean {
  if (p.length < 8) return false
  return /[A-Za-z]/.test(p) && /\d/.test(p)
}

export default function SignUpScreen() {
  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.log("Auth [SignUp] rendered")
  }

  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const textPrimary = isDark ? "#f9fafb" : "#111827"
  const textMuted = isDark ? "#9ca3af" : "#6b7280"
  const { signUp, signInWithOAuth } = useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthBusy, setOauthBusy] = useState<OAuthProviderId | null>(null)
  const [awaitingEmail, setAwaitingEmail] = useState<string | null>(null)
  const submitLock = useRef(false)

  useEffect(() => {
    void getStoredPendingConfirmationEmail().then(setAwaitingEmail)
  }, [])

  const mismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  async function onSubmit() {
    if (submitLock.current) return
    if (mismatch) {
      setError("Passwords don't match.")
      return
    }
    if (!passwordStrongEnough(password)) {
      setError("Use 8+ characters with at least one letter and one number.")
      return
    }
    const normalized = sanitizeAuthEmailForSupabase(email)
    if (!isPlausibleMailbox(normalized)) {
      setError("Enter a valid email (check spelling, e.g. gmail.com).")
      return
    }
    const cooldownLeft = await getSignupCooldownRemainingMs(normalized)
    if (cooldownLeft > 0) {
      setError(
        `Wait ${formatCooldownWait(cooldownLeft)} before another signup for this email (avoids duplicate confirmation emails).`,
      )
      return
    }
    submitLock.current = true
    setError(null)
    setLoading(true)
    try {
      const { needsEmailConfirmation } = await signUp(
        normalized,
        password,
        name.trim() || normalized.split("@")[0] || "User",
      )
      if (needsEmailConfirmation) {
        await recordEmailConfirmationSent(normalized)
        setAwaitingEmail(normalized)
        return
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed")
    } finally {
      submitLock.current = false
      setLoading(false)
    }
  }

  async function onOAuth(provider: OAuthProviderId) {
    setError(null)
    setOauthBusy(provider)
    try {
      await signInWithOAuth(provider)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Social sign-in failed")
    } finally {
      setOauthBusy(null)
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
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={[styles.hero, { color: textPrimary }]}>
              Sign up for free ladder
            </Text>
            <Text style={[styles.sub, { color: textMuted }]}>
              Supabase email auth — fields stay visible while loading.
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
              {awaitingEmail ? (
                <RNView style={{ gap: 14 }}>
                  <Text style={[styles.awaitTitle, { color: textPrimary }]}>
                    Check your email
                  </Text>
                  <Text style={[styles.awaitBody, { color: textMuted }]}>
                    We requested a confirmation link for {awaitingEmail}. This screen will
                    not send another email. Check spam and your Supabase email settings if
                    nothing arrives.
                  </Text>
                  <Pressable
                    style={[
                      styles.button,
                      {
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        borderColor: WellnessColors.primary,
                        marginTop: 0,
                      },
                    ]}
                    onPress={() => {
                      void clearEmailConfirmationCooldown()
                      setAwaitingEmail(null)
                      setName("")
                      setEmail("")
                      setPassword("")
                      setConfirmPassword("")
                      setError(null)
                    }}
                  >
                    <Text style={[styles.buttonText, { color: WellnessColors.primary }]}>
                      Use a different email
                    </Text>
                  </Pressable>
                </RNView>
              ) : (
                <>
              <TextInput
                style={[authInputStyles.input, { marginBottom: 12 }]}
                placeholder="Name"
                placeholderTextColor={AUTH_PLACEHOLDER}
                autoComplete="name"
                value={name}
                onChangeText={setName}
                editable={!loading && !oauthBusy}
              />

              <TextInput
                style={[authInputStyles.input, { marginBottom: 12 }]}
                placeholder="Email"
                placeholderTextColor={AUTH_PLACEHOLDER}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                editable={!loading && !oauthBusy}
              />

              <RNView style={styles.row}>
                <TextInput
                  style={[authInputStyles.input, styles.inputFlex]}
                  placeholder="Password"
                  placeholderTextColor={AUTH_PLACEHOLDER}
                  secureTextEntry={!showPw}
                  autoComplete="password-new"
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading && !oauthBusy}
                />
                <Pressable
                  onPress={() => setShowPw((s) => !s)}
                  style={styles.eyeBtn}
                  hitSlop={12}
                  accessibilityLabel={showPw ? "Hide password" : "Show password"}
                >
                  <Ionicons
                    name={showPw ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#6b7280"
                  />
                </Pressable>
              </RNView>

              <RNView style={[styles.row, { marginTop: 12 }]}>
                <TextInput
                  style={[
                    authInputStyles.input,
                    styles.inputFlex,
                    mismatch ? { borderColor: "#dc2626", borderWidth: 2 } : null,
                  ]}
                  placeholder="Confirm password"
                  placeholderTextColor={AUTH_PLACEHOLDER}
                  secureTextEntry={!showConfirm}
                  autoComplete="password-new"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading && !oauthBusy}
                />
                <Pressable
                  onPress={() => setShowConfirm((s) => !s)}
                  style={styles.eyeBtn}
                  hitSlop={12}
                  accessibilityLabel={
                    showConfirm ? "Hide confirm password" : "Show confirm password"
                  }
                >
                  <Ionicons
                    name={showConfirm ? "eye-off-outline" : "eye-outline"}
                    size={22}
                    color="#6b7280"
                  />
                </Pressable>
              </RNView>

              {mismatch ? (
                <Text style={styles.mismatch}>Passwords don&apos;t match</Text>
              ) : null}

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[
                  styles.button,
                  (loading || mismatch || oauthBusy) && styles.buttonDisabled,
                ]}
                onPress={() => void onSubmit()}
                disabled={loading || !!oauthBusy || mismatch}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign up</Text>
                )}
              </Pressable>

              <RNView style={styles.dividerRow}>
                <RNView style={[styles.dividerLine, { backgroundColor: isDark ? "#4b5563" : "#e5e7eb" }]} />
                <Text style={[styles.dividerText, { color: textMuted }]}>Or continue with</Text>
                <RNView style={[styles.dividerLine, { backgroundColor: isDark ? "#4b5563" : "#e5e7eb" }]} />
              </RNView>

              <RNView style={styles.socialGrid}>
                {SOCIAL.map((s) => (
                  <Pressable
                    key={s.id}
                    style={({ pressed }) => [
                      styles.socialBtn,
                      {
                        backgroundColor: isDark ? "#252030" : "#fafafa",
                        borderColor: isDark ? "#4b5563" : "#e5e7eb",
                      },
                      pressed && { opacity: 0.85 },
                      oauthBusy && oauthBusy !== s.id && { opacity: 0.5 },
                    ]}
                    onPress={() => void onOAuth(s.id)}
                    disabled={!!oauthBusy || loading}
                  >
                    {oauthBusy === s.id ? (
                      <ActivityIndicator />
                    ) : (
                      <>
                        <FontAwesome5 name={s.icon} size={20} color={s.color} brand />
                        <Text style={[styles.socialLabel, { color: textPrimary }]}>
                          {s.label}
                        </Text>
                      </>
                    )}
                  </Pressable>
                ))}
                {Platform.OS === "ios" ? (
                  <Pressable
                    style={({ pressed }) => [
                      styles.socialBtn,
                      {
                        backgroundColor: isDark ? "#252030" : "#fafafa",
                        borderColor: isDark ? "#4b5563" : "#e5e7eb",
                      },
                      pressed && { opacity: 0.85 },
                      oauthBusy && oauthBusy !== "apple" && { opacity: 0.5 },
                    ]}
                    onPress={() => void onOAuth("apple")}
                    disabled={!!oauthBusy || loading}
                  >
                    {oauthBusy === "apple" ? (
                      <ActivityIndicator />
                    ) : (
                      <>
                        <FontAwesome5 name="apple" size={22} color={textPrimary} brand />
                        <Text style={[styles.socialLabel, { color: textPrimary }]}>Apple</Text>
                      </>
                    )}
                  </Pressable>
                ) : null}
              </RNView>
                </>
              )}
            </RNView>

            <Link href="/(auth)/sign-in" asChild>
              <Pressable style={styles.linkWrap}>
                <Text style={[styles.link, { color: WellnessColors.primary }]}>
                  Already have an account? Sign in
                </Text>
              </Pressable>
            </Link>
          </ScrollView>
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
    paddingBottom: 32,
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
  awaitTitle: { fontSize: 20, fontWeight: "700" },
  awaitBody: { fontSize: 14, lineHeight: 20 },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputFlex: { flex: 1 },
  eyeBtn: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  mismatch: { color: "#dc2626", fontSize: 13, marginTop: 8, fontWeight: "600" },
  error: { color: "#c00", marginTop: 8, fontSize: 14 },
  info: { color: "#2563eb", marginTop: 8, fontSize: 14 },
  button: {
    backgroundColor: "#6b4d8a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 20,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { fontSize: 12 },
  socialGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "center" },
  socialBtn: {
    minWidth: "45%",
    flexGrow: 1,
    maxWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fafafa",
  },
  socialLabel: { fontSize: 15, fontWeight: "600" },
  linkWrap: { marginTop: 24, paddingVertical: 8 },
  link: { textAlign: "center", fontSize: 15 },
})
