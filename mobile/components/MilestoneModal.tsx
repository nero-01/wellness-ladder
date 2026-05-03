import { Image } from "expo-image"
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useEffect, useState } from "react"
import LottieView from "lottie-react-native"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import {
  gapItem,
  gapSection,
  inset,
  padSection,
  radiusLg,
  radiusMd,
  spaceSm,
} from "@/constants/layoutTokens"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessTapMedium } from "@/lib/wellnessFeedback"
import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"
import { Mascot } from "@/components/Mascot"
import { MILESTONE_NOTO, MOOD_MILESTONE_NOTO } from "@/lib/streak-rules"
import type { MoodMilestoneId, TaskMilestoneId } from "@/lib/wellness-data"

const confetti = require("@/assets/lottie/confetti.json")

type Props = {
  visible: boolean
  milestone: TaskMilestoneId | MoodMilestoneId | null
  onClose: () => void
}

function isMoodMilestone(m: TaskMilestoneId | MoodMilestoneId): m is MoodMilestoneId {
  return m.startsWith("mood-")
}

export function MilestoneModal({ visible, milestone, onClose }: Props) {
  const W = useWellnessColors()
  const styles = createStyles(W)
  const [rewardPulse, setRewardPulse] = useState(0)

  useEffect(() => {
    if (visible && milestone) setRewardPulse((p) => p + 1)
  }, [visible, milestone])

  if (!milestone) return null

  const mood = isMoodMilestone(milestone)
  const meta = mood ? MOOD_MILESTONE_NOTO[milestone] : MILESTONE_NOTO[milestone]
  const uri = emojiFamilySvgUrl(meta.code, "noto")
  const subText = mood
    ? MOOD_MILESTONE_NOTO[milestone].sub
    : milestone === "bronze-2"
      ? "Two days strong — keep the spark alive."
      : milestone === "silver-3"
        ? "Three days — your rhythm is building."
        : "A full week — legendary consistency."

  return (
    <Modal
      visible={visible && !!milestone}
      transparent
      animationType="fade"
      onRequestClose={() => {
        wellnessTapMedium()
        onClose()
      }}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <LottieView
            source={confetti}
            autoPlay
            loop={false}
            style={styles.lottie}
          />
          <View style={styles.mascotRow}>
            <Mascot
              state="proud"
              preset="milestone"
              rewardKey={rewardPulse}
              animated
            />
          </View>
          <Text style={styles.kicker}>{mood ? "Mood milestone" : "Milestone"}</Text>
          <Text style={styles.title}>{meta.label}</Text>
          <Image
            source={{ uri }}
            style={mood ? styles.badgeImgLarge : styles.badgeImg}
            contentFit="contain"
            accessibilityLabel={meta.label}
          />
          <Text style={styles.sub}>{subText}</Text>
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.92 }]}
            onPress={() => {
              wellnessTapMedium()
              onClose()
            }}
          >
            <Text style={styles.btnText}>Add to collection</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "center",
      padding: inset,
    },
    mascotRow: {
      alignItems: "center",
      marginBottom: spaceSm,
      marginTop: -spaceSm,
    },
    sheet: {
      borderRadius: radiusLg,
      padding: padSection,
      backgroundColor: W.bgElevated,
      borderWidth: 1,
      borderColor: W.cardBorder,
      alignItems: "center",
    },
    lottie: { width: 200, height: 160, marginBottom: spaceSm },
    kicker: {
      fontSize: 11,
      fontWeight: "800",
      letterSpacing: 1,
      color: W.primary,
      textTransform: "uppercase",
      marginBottom: 6,
    },
    title: {
      fontSize: 22,
      fontWeight: "800",
      color: W.text,
      letterSpacing: -0.3,
      marginBottom: gapItem,
      textAlign: "center",
    },
    badgeImg: { width: 88, height: 88, marginBottom: 12 },
    badgeImgLarge: { width: 100, height: 100, marginBottom: 12 },
    sub: {
      fontSize: 15,
      color: W.textMuted,
      textAlign: "center",
      lineHeight: 22,
      marginBottom: gapSection,
    },
    btn: {
      backgroundColor: W.primary,
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: radiusMd,
    },
    btnText: { color: "#F5F7FF", fontWeight: "800", fontSize: 16 },
  })
}
