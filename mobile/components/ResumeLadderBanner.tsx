import { Pressable, StyleSheet, Text, View } from "react-native"
import { Mascot } from "@/components/Mascot"
import { gapSection, padCard, radiusMd, radiusSm } from "@/constants/layoutTokens"
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
        <Mascot state="supportive" preset="banner" animated />
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
      padding: padCard,
      borderRadius: radiusMd,
      backgroundColor: W.iconBg,
      borderWidth: 1,
      borderColor: W.primary,
      marginBottom: gapSection,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: radiusMd,
      backgroundColor: W.surfaceMuted,
      alignItems: "center",
      justifyContent: "center",
      overflow: "visible",
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
      borderRadius: radiusSm,
    },
    btnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  })
}
