import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useMemo } from "react"
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { wellnessCardShadow } from "@/constants/homeCard"
import { radiusInner, radiusMd, radiusSm } from "@/constants/layoutTokens"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import type { Task } from "@/lib/wellness-data"
import { taskStepIoniconName } from "@/lib/task-step-icons"

type CardVariant = "today" | "muted"

function createStyles(W: WellnessPalette, variant: CardVariant) {
  const isToday = variant === "today"
  return StyleSheet.create({
    root: {
      width: 156,
      minHeight: 200,
      borderRadius: radiusMd,
      padding: 16,
      backgroundColor: isToday ? W.iconBg : W.bgElevated,
      borderWidth: 1,
      borderColor: isToday ? "rgba(139, 92, 246, 0.42)" : W.cardBorder,
      ...wellnessCardShadow,
    },
    rootPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.98 }],
    },
    stepLabel: {
      fontSize: 10,
      fontWeight: "700",
      color: W.textMuted,
      letterSpacing: 0.6,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    iconWell: {
      width: 48,
      height: 48,
      borderRadius: radiusInner,
      backgroundColor: W.bgElevated,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 10,
      borderWidth: 1,
      borderColor: isToday ? "rgba(139, 92, 246, 0.38)" : W.cardBorder,
    },
    title: {
      fontSize: 14,
      fontWeight: "700",
      color: isToday ? W.text : W.text,
      minHeight: 40,
      lineHeight: 19,
    },
    titleToday: {
      color: W.primary,
    },
    meta: {
      fontSize: 12,
      color: W.textMuted,
      marginTop: 6,
    },
    todayTag: {
      marginTop: 10,
      alignSelf: "flex-start",
      backgroundColor: W.primary,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: radiusSm,
    },
    todayTagText: {
      fontSize: 10,
      fontWeight: "800",
      color: "#fff",
      letterSpacing: 0.3,
    },
  })
}

type CatalogCardProps = {
  task: Task
  stepNumber: number
  variant: CardVariant
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

/** Horizontal ladder card — replaces emoji Noto step tiles. */
export function TaskStepCatalogCard({
  task,
  stepNumber,
  variant,
  onPress,
  style,
}: CatalogCardProps) {
  const W = useWellnessColors()
  const styles = useMemo(() => createStyles(W, variant), [W, variant])
  const iconName = taskStepIoniconName(task.id)

  const inner = (
    <>
      <Text style={styles.stepLabel}>Step {stepNumber}</Text>
      <View style={styles.iconWell} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Ionicons name={iconName} size={26} color={W.primary} />
      </View>
      <Text
        style={[styles.title, variant === "today" && styles.titleToday]}
        numberOfLines={2}
      >
        {task.title}
      </Text>
      <Text style={styles.meta}>~{task.duration}s</Text>
      {variant === "today" ?
        <View style={styles.todayTag}>
          <Text style={styles.todayTagText}>Today</Text>
        </View>
      : null}
    </>
  )

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.root, pressed && styles.rootPressed, style]}
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
          onPress()
        }}
        accessibilityRole="button"
        accessibilityLabel={`Step ${stepNumber}: ${task.title}. ${variant === "today" ? "Today’s step." : "Preview."}`}
      >
        {inner}
      </Pressable>
    )
  }

  return <View style={[styles.root, style]}>{inner}</View>
}

const wellStyles = (W: WellnessPalette, size: number) =>
  StyleSheet.create({
    /** Border-only — avoids double elevation when this sits on a shadowed card */
    well: {
      width: size,
      height: size,
      borderRadius: size * 0.3,
      backgroundColor: W.bgElevated,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: W.cardBorder,
    },
  })

type IconWellProps = {
  taskId: number
  /** Outer square size (icon scales inside) */
  size: number
  /** Tint for icon */
  accent?: boolean
  accessibilityLabel?: string
}

/** Compact glyph well — use inside task hero, home preview, completion next-step. */
export function TaskStepIconWell({
  taskId,
  size,
  accent,
  accessibilityLabel,
}: IconWellProps) {
  const W = useWellnessColors()
  const styles = useMemo(() => wellStyles(W, size), [W, size])
  const iconName = taskStepIoniconName(taskId)
  const iconPx = Math.round(size * 0.45)
  return (
    <View
      style={[
        styles.well,
        accent && { borderColor: "rgba(139, 92, 246, 0.45)", backgroundColor: W.iconBg },
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
    >
      <Ionicons name={iconName} size={iconPx} color={W.primary} />
    </View>
  )
}
