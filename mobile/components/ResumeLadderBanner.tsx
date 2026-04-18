import { Ionicons } from "@expo/vector-icons"
import { Pressable, StyleSheet, Text, View } from "react-native"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessTapLight } from "@/lib/wellnessFeedback"

type Props = {
  onResume: () => void
  maxStreak: number
}

export function ResumeLadderBanner({ onResume, maxStreak }: Props) {
  const W = useWellnessColors()
  const styles = createStyles(W)

  return (
    <View
      style={styles.banner}
      accessibilityRole="alert"
    >
      <View style={styles.iconWrap}>
        <Ionicons name="trail-sign-outline" size={22} color={W.primary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>Resume your ladder?</Text>
        <Text style={styles.sub}>
          Your daily chain paused — no worries. Complete today’s task + mood
          check-in to restart. Resume bonus: +1 extra mood streak day when you
          finish today{maxStreak > 0 ? ` (best run: ${maxStreak} days)` : ""}.
        </Text>
        <Pressable
          onPress={() => {
            wellnessTapLight()
            onResume()
          }}
          style={({ pressed }) => [styles.btn, pressed && { opacity: 0.9 }]}
          accessibilityRole="button"
          accessibilityLabel="Dismiss resume message"
        >
          <Text style={styles.btnText}>Let’s go</Text>
        </Pressable>
      </View>
    </View>
  )
}

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    banner: {
      flexDirection: "row",
      gap: 12,
      padding: 14,
      borderRadius: 16,
      backgroundColor: W.iconBg,
      borderWidth: 1,
      borderColor: W.primary,
      marginBottom: 16,
    },
    iconWrap: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: W.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
    },
    body: { flex: 1 },
    title: { fontSize: 16, fontWeight: "800", color: W.text, marginBottom: 4 },
    sub: {
      fontSize: 14,
      color: W.textMuted,
      lineHeight: 20,
      marginBottom: 10,
    },
    btn: {
      alignSelf: "flex-start",
      backgroundColor: W.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  })
}
