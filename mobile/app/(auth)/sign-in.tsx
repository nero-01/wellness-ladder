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
import { AUTH_PLACEHOLDER, authInputStyles } from "@/constants/authFormStyles"
import { useAuth } from "@/contexts/AuthContext"

export default function SignInScreen() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit() {
    setError(null)
    setLoading(true)
    try {
      await signIn(email.trim(), password)
      // Navigation: `useProtectedRoute` in app/_layout.tsx sends authed users to /(tabs)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>Sign in</Text>
        <Text style={styles.hint}>
          Use a Supabase JWT anon key (eyJ…) and a real user, or set EXPO_PUBLIC_USE_MOCK_AUTH=true
          for local mock login (see mobile/.env.example).
        </Text>
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
          placeholder="Password"
          placeholderTextColor={AUTH_PLACEHOLDER}
          secureTextEntry
          autoComplete="password"
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={() => void onSubmit()}
          disabled={loading}
        >
          {loading ?
            <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>Sign in</Text>}
        </Pressable>
        <Link href="/(auth)/sign-up" asChild>
          <Pressable>
            <Text style={styles.link}>Create an account</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: "center", gap: 12 },
  title: { fontSize: 24, fontWeight: "700" },
  hint: { opacity: 0.7, marginBottom: 8 },
  error: { color: "#c00" },
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
