import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import type { StreakData } from "@/lib/wellness-data"

function createCelebrationStyles(W: WellnessPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: W.bg },
    completionScroll: {
      padding: 24,
      alignItems: "center",
      paddingTop: 16,
    },
    backBtn: { alignSelf: "flex-start", marginBottom: 16 },
    completionIconWrap: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: W.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
      shadowColor: W.primary,
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    completionTitle: {
      fontSize: 26,
      fontWeight: "800",
      color: W.text,
      marginBottom: 8,
    },
    completionSub: {
      fontSize: 16,
      color: W.textMuted,
      textAlign: "center",
      marginBottom: 20,
    },
    streakBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 16,
      backgroundColor: W.iconBg,
    },
    streakText: { fontWeight: "700", fontSize: 17, color: W.text },
    streakFlame: { fontSize: 20 },
    completionHint: {
      fontSize: 14,
      color: W.textMuted,
      textAlign: "center",
      marginTop: 16,
      marginBottom: 28,
    },
    completionActions: { flexDirection: "row", gap: 12 },
    outlineBtn: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    outlineBtnText: { color: W.text, fontWeight: "600" },
    primaryBtn: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: W.primary,
    },
    primaryBtnText: { color: "#fff", fontWeight: "700" },
  })
}

type Props = {
  streakData: StreakData
}

export function TaskCompletionCelebration({ streakData }: Props) {
  const router = useRouter()
  const W = useWellnessColors()
  const styles = useMemo(() => createCelebrationStyles(W), [W])

  function StreakBadge({ days }: { days: number }) {
    return (
      <View style={styles.streakBadge}>
        <Text style={styles.streakText}>Day {days}</Text>
        <Text style={styles.streakFlame}>🔥</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.completionScroll}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={26} color={W.text} />
        </Pressable>

        <View style={styles.completionIconWrap}>
          <Ionicons name="checkmark" size={48} color="#fff" />
        </View>
        <Text style={styles.completionTitle}>Well Done!</Text>
        <Text style={styles.completionSub}>
          {"You've completed today's wellness task."}
        </Text>
        <StreakBadge days={streakData.currentStreak} />
        <Text style={styles.completionHint}>
          Come back tomorrow for your next step up the ladder!
        </Text>
        <View style={styles.completionActions}>
          <Pressable
            style={styles.outlineBtn}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.outlineBtnText}>Home</Text>
          </Pressable>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={styles.primaryBtnText}>View Progress</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
