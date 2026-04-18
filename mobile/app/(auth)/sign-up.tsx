import { useState } from "react"
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
} from "react-native"
import { Link } from "expo-router"
import { Text, View } from "@/components/Themed"
import { useColorScheme } from "@/components/useColorScheme"
import { AUTH_PLACEHOLDER, authInputStyles } from "@/constants/authFormStyles"
import { WellnessColors, WellnessColorsLight } from "@/constants/wellnessTheme"
import { useAuth } from "@/contexts/AuthContext"

export default function SignUpScreen() {
  const colorScheme = useColorScheme()
  const screenBg =
    colorScheme === "light" ? WellnessColorsLight.bg : WellnessColors.bg
  const { signUp } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const { needsEmailConfirmation } = await signUp(
        email.trim(),
        password,
        name.trim() || email.split("@")[0] || "User",
      )
      if (needsEmailConfirmation) {
        setInfo(
          "Check your email — open the confirmation link to finish onboarding.",
        )
        return
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign up failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { backgroundColor: screenBg }]}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Create account</Text>
        <TextInput
          style={authInputStyles.input}
          placeholder="Name"
          placeholderTextColor={AUTH_PLACEHOLDER}
          autoComplete="name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={authInputStyles.input}
          placeholder="Email"
          placeholderTextColor={AUTH_PLACEHOLDER}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={authInputStyles.input}
          placeholder="Password (min 6)"
          placeholderTextColor={AUTH_PLACEHOLDER}
          secureTextEntry
          autoComplete="password-new"
          value={password}
          onChangeText={setPassword}
        />
        {info ? <Text style={styles.info}>{info}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => void onSubmit()}
          disabled={loading}
        >
          {loading ?
            <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Sign up</Text>}
        </Pressable>
        <Link href="/(auth)/sign-in" asChild>
          <Pressable>
            <Text style={styles.link}>Already have an account? Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  error: { color: "#c00" },
  info: { color: "#2563eb", fontSize: 14 },
  button: {
    backgroundColor: "#6b4d8a",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  link: { color: "#6b4d8a", textAlign: "center", marginTop: 16 },
})
