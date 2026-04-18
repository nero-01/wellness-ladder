import { Pressable, StyleSheet } from "react-native"
import { Text, View } from "@/components/Themed"
import { useAuth } from "@/contexts/AuthContext"
import { WellnessColors } from "@/constants/wellnessTheme"

export default function ProfileScreen() {
  const { user, signOut } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      {user ?
        <>
          <Text style={styles.row}>{user.name}</Text>
          <Text style={styles.rowMuted}>{user.email}</Text>
          <Pressable style={styles.outline} onPress={() => void signOut()}>
            <Text style={styles.outlineText}>Sign out</Text>
          </Pressable>
        </>
      : <Text>Not signed in</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 8,
    backgroundColor: WellnessColors.bg,
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 12 },
  row: { fontSize: 18 },
  rowMuted: { fontSize: 15, opacity: 0.7 },
  outline: {
    marginTop: 24,
    borderWidth: 1,
    borderColor: "#6b4d8a",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineText: { color: "#6b4d8a", fontWeight: "600" },
})
