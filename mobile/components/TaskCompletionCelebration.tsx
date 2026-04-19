import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { LinearGradient } from "expo-linear-gradient"
import * as Speech from "expo-speech"
import { useRouter } from "expo-router"
import LottieView from "lottie-react-native"
import { useEffect, useMemo, useState } from "react"
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Mascot } from "@/components/Mascot"
import { TaskNotoIcon } from "@/components/TaskNotoIcon"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessCelebration, wellnessTapLight } from "@/lib/wellnessFeedback"
import { emojiFamilySvgUrl } from "@/lib/mood-picker-data"
import { proMoodInsightLine } from "@/lib/mood-insight"
import {
  formatSadagTipDate,
  getSadagTipForDate,
  SADAG_HELPLINE_ALT,
  SADAG_HELPLINE_PRIMARY,
  SADAG_WHATSAPP_URL,
} from "@/lib/sadag-tips"
import type { StreakData } from "@/lib/wellness-data"
import { getTodayTask } from "@/lib/wellness-data"
import { useWellnessLocale } from "@/lib/wellness-locale"
import { isWellnessPro } from "@/lib/wellness-pro"
import { getSpeechLocaleCode, localizeTaskForLocale } from "@/lib/za-afrikaans-tasks"

const confetti = require("@/assets/lottie/confetti.json")
const STREAK_FLAME_NOTO = "1f525"
const SA_FLAG_NOTO = "1f1ff-1f1e6"

function celebrationCopy(locale: "en" | "af") {
  if (locale === "af") {
    return {
      title: "Mooi so!",
      subtitle:
        "Jy het vandag se welstandstaak voltooi. Sien jou môre vir die volgende tree.",
      nextLabel: "Volgende op jou leer",
      streakLabel: (n: number) =>
        n === 1 ? "1 dag-streep" : `${n} dae-streep`,
      moodStreakLabel: (n: number) =>
        n === 1 ? "1 stemming-streep" : `${n} stemming-dae op ry`,
      tomorrow: "môre",
      hint: "Kom môre terug vir jou volgende tree op die leer!",
      home: "Tuis",
      progress: "Vordering",
      needHelp: "Hulp nodig?",
      sadagFree: "Gratis 24/7",
      whatsapp: "WhatsApp-hulplyn",
      tipLabel: "Dagwenk",
      inspiredBy: "Geïnspireer deur SADAG — nie mediese advies nie.",
      listenTip: "Luister",
      shareTip: "Deel",
    }
  }
  return {
    title: "Well done!",
    subtitle:
      "You've completed today's wellness task. See you tomorrow for the next step.",
    nextLabel: "Next on your ladder",
    streakLabel: (n: number) => (n === 1 ? "1 day streak" : `${n} day streak`),
    moodStreakLabel: (n: number) =>
      n === 1 ? "1-day mood streak" : `${n}-day mood streak`,
    tomorrow: "tomorrow",
    hint: "Come back tomorrow for your next step up the ladder!",
    home: "Home",
    progress: "View Progress",
    needHelp: "Need help?",
    sadagFree: "free 24/7",
    whatsapp: "WhatsApp helpline",
    tipLabel: "Daily tip",
    inspiredBy: "Inspired by SADAG — not medical advice.",
    listenTip: "Listen",
    shareTip: "Share",
  }
}

function createCelebrationStyles(W: WellnessPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: W.bg },
    lottieWrap: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 320,
      alignItems: "center",
      pointerEvents: "none",
    },
    completionScroll: {
      padding: 24,
      alignItems: "center",
      paddingTop: 16,
    },
    backBtn: { alignSelf: "flex-start", marginBottom: 16 },
    mascotCelebrationWrap: {
      alignSelf: "center",
      width: 150,
      height: 150,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
      position: "relative",
    },
    checkBadge: {
      position: "absolute",
      bottom: 10,
      right: 6,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 3,
      borderColor: W.bg,
      shadowColor: W.primary,
      shadowOpacity: 0.45,
      shadowRadius: 10,
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
    streakRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 12,
      flexWrap: "wrap",
      justifyContent: "center",
    },
    flame: { width: 44, height: 44 },
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
    previewCard: {
      width: "100%",
      maxWidth: 400,
      padding: 18,
      borderRadius: 16,
      backgroundColor: W.bgElevated,
      borderWidth: 1,
      borderColor: W.cardBorder,
      marginBottom: 16,
    },
    previewLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: W.textMuted,
      marginBottom: 12,
    },
    previewRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
    previewTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: W.text,
      flex: 1,
    },
    previewBody: { fontSize: 13, color: W.textMuted, marginTop: 6, lineHeight: 18 },
    previewMeta: { fontSize: 12, color: W.primary, marginTop: 8 },
    proCard: {
      width: "100%",
      maxWidth: 400,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: W.primary,
      backgroundColor: W.iconBg,
      marginBottom: 20,
    },
    proLabel: {
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.6,
      textTransform: "uppercase",
      color: W.primary,
      marginBottom: 6,
    },
    proBody: { fontSize: 14, color: W.text, lineHeight: 20 },
    completionHint: {
      fontSize: 14,
      color: W.textMuted,
      textAlign: "center",
      marginBottom: 20,
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
    sadagGradient: {
      width: "100%",
      maxWidth: 400,
      padding: 16,
      borderRadius: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    sadagFlagRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
    sadagFlag: { width: 28, height: 28, borderRadius: 4 },
    sadagTitle: { fontSize: 13, fontWeight: "700", color: W.text, flex: 1 },
    sadagTip: {
      fontSize: 15,
      fontWeight: "600",
      color: W.primary,
      marginBottom: 12,
      lineHeight: 22,
    },
    sadagDate: { fontSize: 11, color: W.textMuted, marginBottom: 10 },
    sadagLines: { gap: 6, marginBottom: 10 },
    sadagLine: { fontSize: 14, color: W.text, lineHeight: 20 },
    sadagMuted: { fontSize: 12, color: W.textMuted },
    sadagActions: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginBottom: 10 },
    sadagMiniBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    sadagMiniText: { fontSize: 13, fontWeight: "600", color: W.text },
    sadagLinkBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      alignSelf: "flex-start",
      marginTop: 4,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: W.iconBg,
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
    sadagLinkText: { fontSize: 14, fontWeight: "600", color: W.primary },
    sadagFooter: {
      fontSize: 11,
      color: W.textMuted,
      marginTop: 8,
      lineHeight: 16,
    },
  })
}

type Props = {
  streakData: StreakData
}

export function TaskCompletionCelebration({ streakData }: Props) {
  const router = useRouter()
  const W = useWellnessColors()
  const styles = useMemo(() => createCelebrationStyles(W), [W])
  const pro = isWellnessPro()
  const { locale, ready: localeReady } = useWellnessLocale()
  const effectiveLocale = localeReady ? locale : "en"
  const copy = useMemo(() => celebrationCopy(effectiveLocale), [effectiveLocale])

  const [tipAnchor] = useState(() => new Date())
  const sadagTip = useMemo(
    () => getSadagTipForDate(tipAnchor, effectiveLocale),
    [tipAnchor, effectiveLocale],
  )
  const tipDateLabel = useMemo(() => formatSadagTipDate(tipAnchor), [tipAnchor])
  const proInsight = useMemo(
    () => proMoodInsightLine(streakData.moodHistory),
    [streakData.moodHistory],
  )

  const nextTask = useMemo(() => {
    const nextDay = streakData.currentStreak + 1
    const base = getTodayTask(nextDay)
    return localizeTaskForLocale(base, nextDay, effectiveLocale)
  }, [streakData.currentStreak, effectiveLocale])

  const flameUri = emojiFamilySvgUrl(STREAK_FLAME_NOTO, "noto")
  const saFlagUri = useMemo(() => emojiFamilySvgUrl(SA_FLAG_NOTO, "noto"), [])

  useEffect(() => {
    wellnessCelebration()
  }, [])

  const speakTip = () => {
    wellnessTapLight()
    try {
      Speech.stop()
      Speech.speak(sadagTip, {
        language: getSpeechLocaleCode(effectiveLocale),
        rate: Platform.select({ ios: 0.9, android: 0.95, default: 0.9 }),
        pitch: 1,
      })
    } catch {
      /* ignore */
    }
  }

  const shareTip = async () => {
    wellnessTapLight()
    try {
      await Share.share({
        message: `${sadagTip}\n\nSADAG ${SADAG_HELPLINE_PRIMARY} / ${SADAG_HELPLINE_ALT} · ${SADAG_WHATSAPP_URL}`,
      })
    } catch {
      /* ignore */
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.lottieWrap}>
        <LottieView
          source={confetti}
          autoPlay
          loop={false}
          style={{ width: 360, height: 300 }}
        />
      </View>
      <ScrollView
        style={{ flex: 1, backgroundColor: "transparent" }}
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

        <View style={styles.mascotCelebrationWrap}>
          <Mascot
            state="celebrating"
            size={120}
            animated
            locale={effectiveLocale === "af" ? "af" : "en"}
          />
          <View style={[styles.checkBadge, { backgroundColor: W.primary }]}>
            <Ionicons name="checkmark" size={28} color="#fff" />
          </View>
        </View>
        <Text style={styles.completionTitle}>{copy.title}</Text>
        <Text style={styles.completionSub}>{copy.subtitle}</Text>

        <View style={styles.streakRow}>
          <Image
            source={{ uri: flameUri }}
            style={styles.flame}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>
              {copy.streakLabel(streakData.currentStreak)}
            </Text>
          </View>
        </View>
        <View style={[styles.streakRow, { marginBottom: 20 }]}>
          <Text style={styles.streakText}>
            {copy.moodStreakLabel(streakData.moodStreak)}
          </Text>
        </View>

        <LinearGradient
          colors={[W.iconBg, W.bgElevated]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.sadagGradient}
        >
          <View style={styles.sadagFlagRow}>
            <Image
              source={{ uri: saFlagUri }}
              style={styles.sadagFlag}
              contentFit="contain"
            />
            <Text style={styles.sadagTitle}>
              {copy.needHelp} SADAG · {copy.sadagFree}
            </Text>
          </View>
          <Text style={styles.sadagTip}>{sadagTip}</Text>
          <Text style={styles.sadagDate}>
            {copy.tipLabel} · {tipDateLabel}
          </Text>
          <View style={styles.sadagActions}>
            <Pressable
              style={({ pressed }) => [styles.sadagMiniBtn, pressed && { opacity: 0.9 }]}
              onPress={speakTip}
            >
              <Ionicons name="volume-high" size={18} color={W.primary} />
              <Text style={styles.sadagMiniText}>{copy.listenTip}</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.sadagMiniBtn, pressed && { opacity: 0.9 }]}
              onPress={() => void shareTip()}
            >
              <Ionicons name="share-outline" size={18} color={W.primary} />
              <Text style={styles.sadagMiniText}>{copy.shareTip}</Text>
            </Pressable>
          </View>
          <View style={styles.sadagLines}>
            <Text style={styles.sadagLine}>
              SADAG: {SADAG_HELPLINE_PRIMARY} / {SADAG_HELPLINE_ALT}
            </Text>
            <Text style={styles.sadagMuted}>({copy.sadagFree})</Text>
          </View>
          <Pressable
            style={({ pressed }) => [styles.sadagLinkBtn, pressed && { opacity: 0.9 }]}
            onPress={() => void Linking.openURL(SADAG_WHATSAPP_URL)}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
            <Text style={styles.sadagLinkText}>{copy.whatsapp}</Text>
          </Pressable>
          <Text style={styles.sadagFooter}>{copy.inspiredBy}</Text>
        </LinearGradient>

        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>{copy.nextLabel}</Text>
          <View style={styles.previewRow}>
            <TaskNotoIcon iconCode={nextTask.iconCode} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={styles.previewTitle}>{nextTask.title}</Text>
              <Text style={styles.previewBody} numberOfLines={4}>
                {nextTask.instruction}
              </Text>
              <Text style={styles.previewMeta}>
                ~{nextTask.duration}s · {copy.tomorrow}
              </Text>
            </View>
          </View>
        </View>

        {pro && proInsight ?
          <View style={styles.proCard}>
            <Text style={styles.proLabel}>Pro · mood insight</Text>
            <Text style={styles.proBody}>{proInsight}</Text>
          </View>
        : pro ?
          <View style={styles.proCard}>
            <Text style={styles.proLabel}>Pro bonus</Text>
            <Text style={styles.proBody}>
              {effectiveLocale === "af"
                ? "Volledige Afrikaans vir die eerste 7 dae, ekstra wenke in die wenkkaart, en stemming-insigte wanneer jy genoeg kere ingeteken het."
                : "Full Afrikaans for the first seven ladder days, richer tips in the card above, and mood insights when you have enough check-ins."}
            </Text>
          </View>
        : null}

        <Text style={styles.completionHint}>{copy.hint}</Text>
        <View style={styles.completionActions}>
          <Pressable
            style={styles.outlineBtn}
            onPress={() => router.push("/(tabs)")}
          >
            <Text style={styles.outlineBtnText}>{copy.home}</Text>
          </Pressable>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push("/(tabs)/profile")}
          >
            <Text style={styles.primaryBtnText}>{copy.progress}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
