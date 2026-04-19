import type { ComponentProps } from "react"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  ToastAndroid,
  View as RNView,
} from "react-native"
import * as Haptics from "expo-haptics"
import { FontAwesome5 } from "@expo/vector-icons"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { Link, useRouter } from "expo-router"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { SafeAreaView } from "react-native-safe-area-context"
import { Text } from "@/components/Themed"
import { Mascot } from "@/components/Mascot"
import { FloatingLabelInput } from "@/components/auth/FloatingLabelInput"
import { useColorScheme } from "@/components/useColorScheme"
import type { OAuthProviderId } from "@/contexts/AuthContext"
import { useAuth } from "@/contexts/AuthContext"
import {
  clearEmailConfirmationCooldown,
  formatCooldownWait,
  formatResendWait,
  getResendCooldownRemainingMs,
  getSignupCooldownRemainingMs,
  getStoredPendingConfirmationEmail,
  recordEmailConfirmationSent,
  recordResendConfirmationAttempt,
} from "@/lib/email-signup-cooldown"
import { isPlausibleMailbox, sanitizeAuthEmailForSupabase } from "@/lib/auth-email"
import { IS_DEV_BYPASS } from "@/constants/devBypass"
import { WellnessColors } from "@/constants/wellnessTheme"
import { isAuthRateLimitError } from "@/utils/auth-errors"

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log("Auth [SignUp] — Expo + Supabase Auth (not Clerk). Verify SMTP in Supabase Dashboard.")
}

const SUPPORT_EMAIL = "support@sadag-inspired.com"

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
  const router = useRouter()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === "dark"
  const textPrimary = isDark ? "#f9fafb" : "#111827"
  const textMuted = isDark ? "#9ca3af" : "#6b7280"
  const border = isDark ? "#4b5563" : "#d1d5db"
  const inputBg = isDark ? "#252030" : "#ffffff"
  const labelFloat = isDark ? "#a78bfa" : WellnessColors.primary
  const labelInside = isDark ? "#9ca3af" : "#6b7280"

  const { signUp, signInWithOAuth, resendSignupEmail, signInWithDevBypass } =
    useAuth()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [infoBanner, setInfoBanner] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [oauthBusy, setOauthBusy] = useState<OAuthProviderId | null>(null)
  const [awaitingEmail, setAwaitingEmail] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldownMs, setResendCooldownMs] = useState(0)
  const [bypassBusy, setBypassBusy] = useState(false)
  const submitLock = useRef(false)

  useEffect(() => {
    void getStoredPendingConfirmationEmail().then(setAwaitingEmail)
  }, [])

  const refreshResendCooldown = useCallback(async (addr: string) => {
    const ms = await getResendCooldownRemainingMs(addr)
    setResendCooldownMs(ms)
  }, [])

  useEffect(() => {
    if (!awaitingEmail) {
      setResendCooldownMs(0)
      return
    }
    void refreshResendCooldown(awaitingEmail)
    const t = setInterval(() => {
      void refreshResendCooldown(awaitingEmail)
    }, 1000)
    return () => clearInterval(t)
  }, [awaitingEmail, refreshResendCooldown])

  const mismatch =
    confirmPassword.length > 0 && password !== confirmPassword

  async function onSubmit() {
    if (submitLock.current) return
    if (mismatch) {
      setError("Passwords don't match.")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }
    if (!passwordStrongEnough(password)) {
      setError("Use 8+ characters with at least one letter and one number.")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }
    const normalized = sanitizeAuthEmailForSupabase(email)
    if (!isPlausibleMailbox(normalized)) {
      setError("Enter a valid email (check spelling, e.g. gmail.com).")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
      return
    }
    const cooldownLeft = await getSignupCooldownRemainingMs(normalized)
    if (cooldownLeft > 0) {
      setError(
        `Wait ${formatCooldownWait(cooldownLeft)} before another signup for this email (avoids duplicate confirmation emails).`,
      )
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      return
    }
    submitLock.current = true
    setError(null)
    setInfoBanner(null)
    setLoading(true)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      const { needsEmailConfirmation } = await signUp(
        normalized,
        password,
        name.trim() || normalized.split("@")[0] || "User",
      )
      if (needsEmailConfirmation) {
        await recordEmailConfirmationSent(normalized)
        setAwaitingEmail(normalized)
        setInfoBanner(
          "Check your spam or promotions folder. Still stuck? Email us — we're happy to help.",
        )
        // eslint-disable-next-line no-console
        console.log("Email sent")
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log(
            "[SignUp] Supabase requested confirmation email. Dashboard: Auth → Providers → Email / SMTP (e.g. Resend).",
          )
        }
        return
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      /** Immediate session (e.g. “Confirm email” off in Dashboard). */
      router.replace("/(tabs)/task")
      if (__DEV__) {
        if (Platform.OS === "android") {
          ToastAndroid.show(
            "Dev: Auto-logged in (immediate session)",
            ToastAndroid.LONG,
          )
        } else {
          Alert.alert(
            "Dev: Auto-logged in",
            "Immediate session (no inbox step). For confirmation email, enable Confirm email in Supabase → Auth → Providers.",
          )
        }
      }
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Sign up failed"
      setError(raw)
      if (__DEV__ && isAuthRateLimitError(raw)) {
        setInfoBanner(
          'Tip: Auth → Providers → Email — turn off "Confirm email" for local testing to avoid repeated sends.',
        )
      }
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      submitLock.current = false
      setLoading(false)
    }
  }

  async function onResendConfirmation() {
    if (!awaitingEmail || resendLoading) return
    const left = await getResendCooldownRemainingMs(awaitingEmail)
    if (left > 0) {
      setError(`Wait ${formatResendWait(left)} before resending.`)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
      return
    }
    setError(null)
    setResendLoading(true)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      await resendSignupEmail(awaitingEmail)
      await recordResendConfirmationAttempt(awaitingEmail)
      await refreshResendCooldown(awaitingEmail)
      setInfoBanner(
        "Another confirmation email was sent. Check spam — or write to support if it still does not arrive.",
      )
      // eslint-disable-next-line no-console
      console.log("Email sent")
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Could not resend email"
      setError(raw)
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
    } finally {
      setResendLoading(false)
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

  async function onOAuth(provider: OAuthProviderId) {
    setError(null)
    setOauthBusy(provider)
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    try {
      await signInWithOAuth(provider)
    } catch (e) {
      const raw = e instanceof Error ? e.message : "Social sign-in failed"
      setError(
        isAuthRateLimitError(raw)
          ? "Too many attempts. Wait a few minutes and try again."
          : raw,
      )
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
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
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            enableOnAndroid
            extraScrollHeight={Platform.OS === "ios" ? 24 : 48}
            contentContainerStyle={styles.scrollContent}
          >
            <RNView style={{ alignItems: "center", marginBottom: 12 }}>
              <Mascot state="encouraging" size={100} animated />
            </RNView>
            <Text style={[styles.hero, { color: textPrimary }]}>
              Sign up for free ladder
            </Text>
            <Text style={[styles.sub, { color: textMuted }]}>
              Supabase email auth — keyboard stays clear of fields (iOS & Android).
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
                    We sent a confirmation link to {awaitingEmail}. Open it on this device to
                    finish sign-up.
                  </Text>
                  <RNView
                    style={[
                      styles.spamBanner,
                      { backgroundColor: isDark ? "#252030" : "#fef3c7", borderColor: isDark ? "#4b5563" : "#fcd34d" },
                    ]}
                  >
                    <Text style={[styles.spamText, { color: isDark ? "#fde68a" : "#92400e" }]}>
                      Check spam / junk — confirmation mail often lands there.
                    </Text>
                  </RNView>
                  {infoBanner ? (
                    <Text style={[styles.info, { color: textMuted }]}>{infoBanner}</Text>
                  ) : null}
                  <Pressable
                    style={[
                      styles.button,
                      (resendLoading || resendCooldownMs > 0) && styles.buttonDisabled,
                    ]}
                    onPress={() => void onResendConfirmation()}
                    disabled={resendLoading || resendCooldownMs > 0}
                  >
                    {resendLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>
                        {resendCooldownMs > 0
                          ? `Resend email (${formatResendWait(resendCooldownMs)})`
                          : "Resend confirmation email"}
                      </Text>
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Wellness%20app%20signup`)}
                    style={styles.supportLink}
                  >
                    <Text style={[styles.supportText, { color: WellnessColors.primary }]}>
                      {SUPPORT_EMAIL}
                    </Text>
                  </Pressable>
                  <Text style={[styles.supportHint, { color: textMuted }]}>
                    Questions? Tap the address above to email support.
                  </Text>
                  <Pressable
                    style={[
                      styles.buttonOutline,
                      { borderColor: WellnessColors.primary },
                    ]}
                    onPress={() => {
                      void clearEmailConfirmationCooldown()
                      setAwaitingEmail(null)
                      setName("")
                      setEmail("")
                      setPassword("")
                      setConfirmPassword("")
                      setError(null)
                      setInfoBanner(null)
                      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                    }}
                  >
                    <Text style={[styles.buttonOutlineText, { color: WellnessColors.primary }]}>
                      Use a different email
                    </Text>
                  </Pressable>
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                </RNView>
              ) : (
                <>
                  <FloatingLabelInput
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                    editable={!loading && !oauthBusy}
                    borderColor={border}
                    backgroundColor={inputBg}
                    textColor={textPrimary}
                    labelColorFloating={labelFloat}
                    labelColorInside={labelInside}
                    placeholderTextColor={labelInside}
                  />
                  <FloatingLabelInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    autoFocus
                    multiline={false}
                    editable={!loading && !oauthBusy}
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
                    autoComplete="password-new"
                    multiline={false}
                    editable={!loading && !oauthBusy}
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
                  <FloatingLabelInput
                    label="Confirm password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    autoComplete="password-new"
                    multiline={false}
                    editable={!loading && !oauthBusy}
                    error={mismatch}
                    borderColor={border}
                    backgroundColor={inputBg}
                    textColor={textPrimary}
                    labelColorFloating={labelFloat}
                    labelColorInside={labelInside}
                    placeholderTextColor={labelInside}
                    rightSlot={
                      <Pressable
                        onPress={() => setShowConfirm((s) => !s)}
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
                    }
                  />

                  {mismatch ? (
                    <Text style={styles.mismatch}>Passwords don&apos;t match</Text>
                  ) : null}

                  {error ? <Text style={styles.error}>{error}</Text> : null}

                  <Pressable
                    style={[
                      styles.button,
                      (loading || mismatch || oauthBusy || bypassBusy) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={() => void onSubmit()}
                    disabled={loading || !!oauthBusy || mismatch || bypassBusy}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Sign up</Text>
                    )}
                  </Pressable>

                  {IS_DEV_BYPASS ? (
                    <Pressable
                      style={[
                        styles.devBypassBtn,
                        {
                          borderColor: WellnessColors.primary,
                          opacity: bypassBusy || oauthBusy ? 0.65 : 1,
                        },
                      ]}
                      onPress={() => void onDevBypass()}
                      disabled={!!oauthBusy || bypassBusy || loading}
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
                    disabled={!!oauthBusy || loading || bypassBusy}
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
                        disabled={!!oauthBusy || loading || bypassBusy}
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
  awaitTitle: { fontSize: 20, fontWeight: "700" },
  awaitBody: { fontSize: 14, lineHeight: 20 },
  spamBanner: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  spamText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  info: { fontSize: 13, lineHeight: 18 },
  supportLink: { alignSelf: "center", paddingVertical: 4 },
  supportText: { fontSize: 15, fontWeight: "700" },
  supportHint: { fontSize: 12, textAlign: "center" },
  mismatch: { color: "#dc2626", fontSize: 13, marginTop: 4, fontWeight: "600" },
  error: { color: "#c00", marginTop: 8, fontSize: 14 },
  button: {
    backgroundColor: "#6b4d8a",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    marginTop: 4,
  },
  buttonOutlineText: { fontWeight: "700", fontSize: 16 },
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
