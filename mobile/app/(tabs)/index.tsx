import { StyleSheet } from "react-native"
import { Text, View } from "@/components/Themed"
import { useAuth } from "@/contexts/AuthContext"

export default function HomeScreen() {
  const { user } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wellness Ladder</Text>
      <Text style={styles.sub}>
        {user ? `Signed in as ${user.name}` : "One small step daily."}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    opacity: 0.8,
    textAlign: "center",
  },
})
