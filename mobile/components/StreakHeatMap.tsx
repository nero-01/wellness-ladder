import { useMemo } from "react"
import { StyleSheet, Text, View } from "react-native"
import { eachDayOfInterval, format, subDays } from "date-fns"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"

type Props = {
  completionDates: Set<string>
  weeks?: number
  title?: string
  hint?: string
  /** Cell color when day is in the set (default: theme primary). */
  activeColor?: string
}

const COLS = 7

/** Simple calendar heat strip: last `weeks`×7 days, local dates. */
export function StreakHeatMap({
  completionDates,
  weeks = 5,
  title = "Activity",
  hint,
  activeColor,
}: Props) {
  const W = useWellnessColors()
  const styles = createStyles(W)

  const days = useMemo(() => {
    const end = new Date()
    const start = subDays(end, weeks * 7 - 1)
    const interval = { start, end }
    return eachDayOfInterval(interval).map((d) => format(d, "yyyy-MM-dd"))
  }, [weeks])

  const rows = Math.ceil(days.length / COLS)

  const hintText =
    hint ?? `Last ${weeks} weeks — one square per day`

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hintText}</Text>
      <View style={styles.grid}>
        {Array.from({ length: rows }).map((_, ri) => (
          <View key={`r-${ri}`} style={styles.row}>
            {Array.from({ length: COLS }).map((__, ci) => {
              const idx = ri * COLS + ci
              const key = days[idx]
              if (!key) return <View key={`e-${ci}`} style={[styles.cell, styles.cellEmpty]} />
              const done = completionDates.has(key)
              const isToday = key === format(new Date(), "yyyy-MM-dd")
              return (
                <View
                  key={key}
                  style={[
                    styles.cell,
                    done ?
                      activeColor ?
                        [styles.cellOff, { backgroundColor: activeColor, opacity: 0.95 }]
                      : styles.cellOn
                    : styles.cellOff,
                    isToday && styles.cellToday,
                  ]}
                  accessibilityLabel={
                    done ? `${key} completed` : `${key} no completion`
                  }
                />
              )
            })}
          </View>
        ))}
      </View>
    </View>
  )
}

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    wrap: { marginTop: 4 },
    title: {
      fontSize: 13,
      fontWeight: "700",
      color: W.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
      marginBottom: 6,
    },
    hint: { fontSize: 12, color: W.textMuted, marginBottom: 12 },
    grid: { gap: 5 },
    row: { flexDirection: "row", gap: 5 },
    cell: {
      width: 14,
      height: 14,
      borderRadius: 3,
    },
    cellEmpty: { opacity: 0 },
    cellOn: { backgroundColor: W.primary, opacity: 0.9 },
    cellOff: { backgroundColor: W.surfaceMuted, borderWidth: 1, borderColor: W.cardBorder },
    cellToday: { borderWidth: 2, borderColor: W.primary },
  })
}
