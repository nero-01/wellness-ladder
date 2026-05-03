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
import { Link, useRouter } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { SafeAreaView } from "react-native-safe-area-context"
import { BrandedScreenBackdrop } from "@/components/BrandedScreenBackdrop"
import { Text } from "@/components/Themed"
import { FloatingLabelInput } from "@/components/auth/FloatingLabelInput"
import type { OAuthProviderId } from "@/contexts/AuthContext"
import { useAuth } from "@/contexts/AuthContext"
import { useAppTheme } from "@/contexts/ThemeContext"
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
import {
  gapItem,
  gapSection,
  inset,
  padCard,
  radiusLg,
  radiusSm,
  spaceLg,
  spaceSm,
  spaceXl,
} from "@/constants/layoutTokens"
import {
  wellnessCardInner,
  wellnessCardOuter,
} from "@/constants/wellnessSurface"
import { useWellnessColors } from "@/hooks/useWellnessColors"
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
  const { isDark } = useAppTheme()
  const W = useWellnessColors()
  const textPrimary = W.text
  const textMuted = W.textMuted
  const border = W.cardBorder
  const inputBg = isDark ? "#252030" : "#ffffff"
  const labelFloat = W.primary
  const labelInside = W.textMuted

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
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.log("[SignUp] confirmation email flow started")
        }
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
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.log("[SignUp] resend confirmation requested")
      }
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
            <Text style={[styles.hero, { color: textPrimary }]}>Create your account</Text>
            <Text style={[styles.sub, { color: textMuted }]}>
              One small daily step toward a calmer routine. Sync your progress across devices.
            </Text>

            <RNView style={[wellnessCardOuter(radiusLg), { alignSelf: "stretch" }]}>
              <RNView
                style={[
                  wellnessCardInner(W, radiusLg, {
                    backgroundColor: W.bgElevated,
                    borderColor: W.cardBorder,
                  }),
                  { padding: padCard },
                ]}
              >
              {awaitingEmail ? (
                <RNView style={{ gap: gapSection }}>
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
                    <Text style={[styles.supportText, { color: W.primary }]}>
                      {SUPPORT_EMAIL}
                    </Text>
                  </Pressable>
                  <Text style={[styles.supportHint, { color: textMuted }]}>
                    Questions? Tap the address above to email support.
                  </Text>
                  <Pressable
                    style={[
                      styles.buttonOutline,
                      { borderColor: W.primary },
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
                    <Text style={[styles.buttonOutlineText, { color: W.primary }]}>
                      Use a different email
                    </Text>
                  </Pressable>
                  {error ? (
                    <Text style={[styles.error, { color: W.danger }]}>{error}</Text>
                  ) : null}
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
                    <Text style={[styles.mismatch, { color: W.danger }]}>
                      Passwords don&apos;t match
                    </Text>
                  ) : null}

                  {error ? (
                    <Text style={[styles.error, { color: W.danger }]}>{error}</Text>
                  ) : null}

                  <Pressable
                    style={[
                      styles.button,
                      { backgroundColor: W.primary },
                      (loading || mismatch || oauthBusy || bypassBusy) &&
                        styles.buttonDisabled,
                    ]}
                    onPress={() => void onSubmit()}
                    disabled={loading || !!oauthBusy || mismatch || bypassBusy}
                  >
                    {loading ? (
                      <ActivityIndicator color="#F5F7FF" />
                    ) : (
                      <Text style={styles.buttonText}>Sign up</Text>
                    )}
                  </Pressable>

                  {IS_DEV_BYPASS ? (
                    <Pressable
                      style={[
                        styles.devBypassBtn,
                        {
                          borderColor: W.primary,
                          opacity: bypassBusy || oauthBusy ? 0.65 : 1,
                        },
                      ]}
                      onPress={() => void onDevBypass()}
                      disabled={!!oauthBusy || bypassBusy || loading}
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

                  <RNView style={styles.dividerRow}>
                    <RNView style={[styles.dividerLine, { backgroundColor: W.cardBorder }]} />
                    <Text style={[styles.dividerText, { color: textMuted }]}>Or continue with</Text>
                    <RNView style={[styles.dividerLine, { backgroundColor: W.cardBorder }]} />
                  </RNView>

                  <RNView style={styles.socialGrid}>
                    {SOCIAL.map((s) => (
                      <Pressable
                        key={s.id}
                        style={({ pressed }) => [
                          styles.socialBtn,
                          {
                            backgroundColor: W.card,
                            borderColor: W.cardBorder,
                          },
                          pressed && { opacity: 0.88 },
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
                            backgroundColor: W.card,
                            borderColor: W.cardBorder,
                          },
                          pressed && { opacity: 0.88 },
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
            </RNView>

            <Link href="/(auth)/sign-in" asChild>
              <Pressable style={styles.linkWrap}>
                <Text style={[styles.link, { color: W.primary }]}>
                  Already have an account? Sign in
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
    paddingHorizontal: inset,
    paddingBottom: 100,
    paddingTop: spaceSm,
  },
  hero: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: -0.4,
    marginBottom: spaceSm,
  },
  sub: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: spaceXl,
  },
  awaitTitle: { fontSize: 20, fontWeight: "700" },
  awaitBody: { fontSize: 14, lineHeight: 20 },
  spamBanner: {
    borderWidth: 1,
    borderRadius: radiusSm,
    padding: padCard,
  },
  spamText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  info: { fontSize: 13, lineHeight: 18 },
  supportLink: { alignSelf: "center", paddingVertical: 4 },
  supportText: { fontSize: 15, fontWeight: "700" },
  supportHint: { fontSize: 12, textAlign: "center" },
  mismatch: { fontSize: 13, marginTop: spaceSm, fontWeight: "600" },
  error: { marginTop: spaceSm, fontSize: 14, fontWeight: "500" },
  button: {
    padding: padCard,
    borderRadius: radiusSm,
    alignItems: "center",
    marginTop: spaceSm,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    padding: padCard,
    borderRadius: radiusSm,
    alignItems: "center",
    borderWidth: 2,
    marginTop: spaceSm,
  },
  buttonOutlineText: { fontWeight: "700", fontSize: 16 },
  buttonDisabled: { opacity: 0.65 },
  buttonText: { color: "#F5F7FF", fontWeight: "700", fontSize: 16 },
  devBypassBtn: {
    marginTop: spaceLg,
    paddingVertical: 14,
    paddingHorizontal: padCard,
    borderRadius: radiusSm,
    borderWidth: 2,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  devBypassText: { fontWeight: "700", fontSize: 15 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spaceSm,
    marginVertical: spaceXl,
  },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: 12 },
  socialGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: gapItem,
    justifyContent: "center",
  },
  socialBtn: {
    minWidth: "45%",
    flexGrow: 1,
    maxWidth: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spaceSm,
    paddingVertical: 14,
    paddingHorizontal: gapItem,
    borderRadius: radiusSm,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "transparent",
  },
  socialLabel: { fontSize: 15, fontWeight: "600" },
  linkWrap: { marginTop: spaceXl + spaceSm, paddingVertical: spaceSm },
  link: { textAlign: "center", fontSize: 15 },
})
