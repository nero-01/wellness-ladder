import { Redirect } from "expo-router"
import { ActivityIndicator, StyleSheet, View } from "react-native"
import { useAuth } from "@/contexts/AuthContext"

/**
 * Entry: wait for auth bootstrap, then send users to sign-in or main tabs.
 * Avoids sending everyone to `/(tabs)` first (which fought `useProtectedRoute` and caused flashes / loops).
 */
export default function Index() {
  const { user, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" accessibilityLabel="Loading session" />
      </View>
    )
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />
  }

  return <Redirect href="/(tabs)" />
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
})
