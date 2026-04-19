import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { LinearGradient } from "expo-linear-gradient"
import { useMemo } from "react"
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { radiusInner, radiusXl } from "@/constants/layoutTokens"
import {
  silentMoonLiftShadow,
  stepSurfaceForTaskId,
  type StepCardSurface,
} from "@/constants/stepCardTheme"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { taskStepIoniconName } from "@/lib/task-step-icons"
import type { Task } from "@/lib/wellness-data"
import { WELLNESS_TASKS } from "@/lib/wellness-data"

function taskTitleForId(taskId: number): string {
  return WELLNESS_TASKS.find((t) => t.id === taskId)?.title ?? "Task"
}

type CardVariant = "today" | "muted"

function createCatalogStyles(
  W: WellnessPalette,
  surface: StepCardSurface,
  variant: CardVariant,
) {
  const isToday = variant === "today"
  return StyleSheet.create({
    rootOuter: {
      width: 158,
      minHeight: 216,
      borderRadius: radiusXl,
      ...silentMoonLiftShadow,
      ...(isToday ?
        Platform.select({
          ios: {
            shadowOpacity: 0.14,
            shadowRadius: 26,
          },
          android: { elevation: 6 },
          default: {},
        })
      : {}),
    },
    rootInner: {
      flex: 1,
      minHeight: 216,
      borderRadius: radiusXl,
      overflow: "hidden",
      backgroundColor: surface.bg,
    },
    rootPressed: {
      opacity: 0.94,
      transform: [{ scale: 0.985 }],
    },
    topRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 8,
    },
    stepEyebrow: {
      fontSize: 10,
      fontWeight: "800",
      color: surface.fgMuted,
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    todayPill: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.92)",
    },
    todayPillText: {
      fontSize: 10,
      fontWeight: "900",
      color: "#3D2F55",
      letterSpacing: 0.6,
    },
    artWrap: {
      flex: 1,
      minHeight: 52,
      marginBottom: 10,
    },
    blob: {
      position: "absolute",
      top: -6,
      right: -18,
      width: 96,
      height: 96,
      borderRadius: 48,
    },
    title: {
      fontSize: 15,
      fontWeight: "800",
      color: surface.fg,
      lineHeight: 20,
      minHeight: 40,
    },
    titleToday: {
      letterSpacing: -0.2,
    },
    meta: {
      fontSize: 11,
      fontWeight: "700",
      color: surface.fgMuted,
      marginTop: 6,
      letterSpacing: 1,
      textTransform: "uppercase",
    },
    pad: {
      padding: 16,
      flex: 1,
      justifyContent: "space-between",
    },
    iconWell: {
      width: 48,
      height: 48,
      borderRadius: radiusInner,
      backgroundColor: W.bgElevated,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      borderWidth: 1,
      borderColor: isToday ? "rgba(139, 92, 246, 0.38)" : W.cardBorder,
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

/**
 * Horizontal ladder tiles — Silent Moon–style surfaces + shaded Ionicons step wells.
 */
export function TaskStepCatalogCard({
  task,
  stepNumber,
  variant,
  onPress,
  style,
}: CatalogCardProps) {
  const W = useWellnessColors()
  const surface = stepSurfaceForTaskId(task.id)
  const styles = useMemo(
    () => createCatalogStyles(W, surface, variant),
    [W, surface, variant],
  )
  const iconName = taskStepIoniconName(task.id)

  const inner = (
    <View style={styles.rootInner}>
      <LinearGradient
        pointerEvents="none"
        colors={["rgba(255,255,255,0.2)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.55 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View
        pointerEvents="none"
        style={[styles.blob, { backgroundColor: surface.blob }]}
      />
      <View style={styles.pad}>
        <View style={styles.topRow}>
          <Text style={styles.stepEyebrow}>Step {stepNumber}</Text>
          {variant === "today" ?
            <View style={styles.todayPill}>
              <Text style={styles.todayPillText}>Today</Text>
            </View>
          : null}
        </View>
        <View
          style={[
            styles.artWrap,
            { alignItems: "center", justifyContent: "center" },
          ]}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <View style={styles.iconWell}>
            <Ionicons name={iconName} size={26} color={W.primary} />
          </View>
        </View>
        <View>
          <Text
            style={[styles.title, variant === "today" && styles.titleToday]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <Text style={styles.meta}>· {task.duration} sec</Text>
        </View>
      </View>
    </View>
  )

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.rootOuter,
          pressed && styles.rootPressed,
          style,
        ]}
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

  return <View style={[styles.rootOuter, style]}>{inner}</View>
}

/** Border-only well — avoids double elevation when nested on shadowed cards */
const wellStyles = (W: WellnessPalette, size: number) =>
  StyleSheet.create({
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
    accent: {
      borderColor: "rgba(139, 92, 246, 0.45)",
      backgroundColor: W.iconBg,
    },
  })

type IconWellProps = {
  taskId: number
  /** Outer square size (monogram scales inside) */
  size: number
  /** Slight highlight ring — for “today” emphasis */
  accent?: boolean
  accessibilityLabel?: string
}

/**
 * Compact shaded well with cycling Ionicons (matches ladder step glyphs).
 */
export function TaskStepIconWell({
  taskId,
  size,
  accent,
  accessibilityLabel,
}: IconWellProps) {
  const W = useWellnessColors()
  const title = accessibilityLabel?.trim() || taskTitleForId(taskId)
  const iconName = taskStepIoniconName(taskId)
  const iconPx = Math.round(size * 0.45)
  const styles = useMemo(() => wellStyles(W, size), [W, size])

  return (
    <View
      style={[styles.well, accent && styles.accent]}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole={accessibilityLabel ? "image" : undefined}
    >
      <Ionicons name={iconName} size={iconPx} color={W.primary} />
    </View>
  )
}
