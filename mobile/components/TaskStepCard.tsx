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
import { radiusXl } from "@/constants/layoutTokens"
import {
  silentMoonLiftShadow,
  stepMonogramLetter,
  stepSurfaceForTaskId,
  type StepCardSurface,
} from "@/constants/stepCardTheme"
import type { Task } from "@/lib/wellness-data"
import { WELLNESS_TASKS } from "@/lib/wellness-data"

function taskTitleForId(taskId: number): string {
  return WELLNESS_TASKS.find((t) => t.id === taskId)?.title ?? "Task"
}

type CardVariant = "today" | "muted"

function createCatalogStyles(surface: StepCardSurface, variant: CardVariant) {
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
 * Horizontal ladder tiles — Silent Moon–style solid surfaces (no step icons).
 */
export function TaskStepCatalogCard({
  task,
  stepNumber,
  variant,
  onPress,
  style,
}: CatalogCardProps) {
  const surface = stepSurfaceForTaskId(task.id)
  const styles = useMemo(
    () => createCatalogStyles(surface, variant),
    [surface, variant],
  )

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
        <View style={styles.artWrap} />
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

const wellStyles = (surface: StepCardSurface, size: number) => {
  const r = Math.round(size * 0.34)
  return StyleSheet.create({
    well: {
      width: size,
      height: size,
      borderRadius: r,
      backgroundColor: surface.bg,
      alignItems: "center",
      justifyContent: "center",
      ...silentMoonLiftShadow,
    },
    monogram: {
      fontSize: Math.round(size * 0.4),
      fontWeight: "800",
      color: surface.fg,
      marginTop: -2,
    },
    accentRing: {
      borderWidth: 2,
      borderColor: "rgba(255,255,255,0.5)",
    },
  })
}

type IconWellProps = {
  taskId: number
  /** Outer square size (monogram scales inside) */
  size: number
  /** Slight highlight ring — for “today” emphasis */
  accent?: boolean
  accessibilityLabel?: string
}

/**
 * Compact step marker: monogram on a Silent Moon surface (replaces Ionicons glyph well).
 */
export function TaskStepIconWell({
  taskId,
  size,
  accent,
  accessibilityLabel,
}: IconWellProps) {
  const title = accessibilityLabel?.trim() || taskTitleForId(taskId)
  const surface = stepSurfaceForTaskId(taskId)
  const letter = stepMonogramLetter(title)
  const styles = useMemo(() => wellStyles(surface, size), [surface, size])

  return (
    <View
      style={[
        styles.well,
        accent && styles.accentRing,
        { backgroundColor: surface.bg },
      ]}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityRole="text"
    >
      <Text style={[styles.monogram, { color: surface.fg }]}>{letter}</Text>
    </View>
  )
}
