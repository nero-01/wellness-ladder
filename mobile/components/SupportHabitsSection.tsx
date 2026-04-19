import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useRouter } from "expo-router"
import { useMemo } from "react"
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native"
import { useRecurringHabitsContext } from "@/contexts/RecurringHabitsContext"
import { wellnessCardShadow } from "@/constants/homeCard"
import { gapSection, padCard, radiusMd, radiusSm } from "@/constants/layoutTokens"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { wellnessTapLight } from "@/lib/wellnessFeedback"
import type { RecurringHabit } from "@/lib/recurring-habits-types"
import { format } from "date-fns"

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    wrap: {
      marginBottom: gapSection,
      paddingVertical: 12,
      paddingHorizontal: padCard,
      borderRadius: radiusMd,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
      ...wellnessCardShadow,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    title: {
      fontSize: 12,
      fontWeight: "700",
      color: W.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    manage: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    manageText: {
      fontSize: 13,
      fontWeight: "600",
      color: W.primary,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: W.cardBorder,
    },
    rowFirst: { borderTopWidth: 0 },
    rowMain: { flex: 1, paddingRight: 10 },
    habitTitle: { fontSize: 15, fontWeight: "600", color: W.text },
    meta: { fontSize: 12, color: W.textMuted, marginTop: 3 },
    streakBadge: {
      alignSelf: "flex-start",
      marginTop: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: radiusSm,
      backgroundColor: W.iconBg,
    },
    streakText: { fontSize: 11, fontWeight: "700", color: W.primary },
    doneBtn: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: radiusSm,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.bgElevated,
    },
    doneBtnDisabled: { opacity: 0.45 },
    doneLabel: { fontSize: 13, fontWeight: "600", color: W.primary },
    loading: { paddingVertical: 8, alignItems: "center" },
  })
}

function repeatLabel(h: RecurringHabit): string {
  try {
    if (h.repeatType === "daily") return "Daily"
    if (h.repeatType === "weekdays") return "Weekdays"
    if (h.repeatType === "custom" && h.repeatDays && h.repeatDays.length > 0) {
      const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
      return h.repeatDays
        .map((d) => names[Math.max(0, Math.min(6, Math.floor(Number(d))))] ?? "—")
        .join(", ")
    }
    return "Custom"
  } catch {
    return "Custom"
  }
}

type Props = {
  previewMode?: boolean
}

export function SupportHabitsSection({ previewMode }: Props) {
  const W = useWellnessColors()
  const styles = useMemo(() => createStyles(W), [W])
  const router = useRouter()
  const { enabledHabits, loading, complete } = useRecurringHabitsContext()

  const todayKey = format(new Date(), "yyyy-MM-dd")

  if (previewMode) return null
  if (loading && enabledHabits.length === 0) {
    return (
      <View style={styles.wrap}>
        <View style={styles.loading}>
          <ActivityIndicator color={W.primary} />
        </View>
      </View>
    )
  }
  if (enabledHabits.length === 0) return null

  return (
    <View style={styles.wrap} accessibilityLabel="Support habits">
      <View style={styles.headerRow}>
        <Text style={styles.title}>Support habits</Text>
        <Pressable
          style={({ pressed }) => [styles.manage, pressed && { opacity: 0.75 }]}
          onPress={() => {
            wellnessTapLight()
            router.push("/recurring-habits")
          }}
          accessibilityRole="button"
        >
          <Text style={styles.manageText}>Manage</Text>
          <Ionicons name="chevron-forward" size={16} color={W.primary} />
        </Pressable>
      </View>

      {enabledHabits.map((h, index) => {
        const doneToday = h.lastCompletedDate === todayKey
        return (
          <View
            key={h.id}
            style={[styles.row, index === 0 && styles.rowFirst]}
          >
            <View style={styles.rowMain}>
              <Text style={styles.habitTitle} numberOfLines={2}>
                {h.title}
              </Text>
              <Text style={styles.meta}>
                {repeatLabel(h)}
                {h.reminderTime ? ` · ${h.reminderTime}` : ""}
              </Text>
              {h.streakCount > 0 ?
                <View style={styles.streakBadge}>
                  <Text style={styles.streakText}>
                    {h.streakCount} day{h.streakCount === 1 ? "" : "s"}
                  </Text>
                </View>
              : null}
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.doneBtn,
                (doneToday || pressed) && styles.doneBtnDisabled,
              ]}
              disabled={doneToday}
              onPress={() => {
                wellnessTapLight()
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
                void complete(h.id).catch(() => {
                  /* hook surfaces no UI; avoid unhandled rejection */
                })
              }}
              accessibilityLabel={
                doneToday ? `${h.title} done today` : `Mark ${h.title} done`
              }
            >
              <Text style={styles.doneLabel}>{doneToday ? "Today" : "Log"}</Text>
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}
