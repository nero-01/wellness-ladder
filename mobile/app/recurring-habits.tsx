import { Ionicons } from "@expo/vector-icons"
import * as Haptics from "expo-haptics"
import { useCallback, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useRecurringHabitsContext } from "@/contexts/RecurringHabitsContext"
import {
  wellnessCardInner,
  wellnessCardOuter,
} from "@/constants/wellnessSurface"
import {
  gapSection,
  inset,
  padCard,
  radiusMd,
} from "@/constants/layoutTokens"
import type { WellnessPalette } from "@/constants/wellnessTheme"
import { useWellnessColors } from "@/hooks/useWellnessColors"
import { ensureNotificationPermissions } from "@/lib/recurring-habit-notifications"
import type { RepeatType } from "@/lib/recurring-habit-streak"
import {
  HABIT_TEMPLATES,
  MAX_RECURRING_HABITS,
  type RecurringHabit,
} from "@/lib/recurring-habits-types"
import { wellnessTapLight } from "@/lib/wellnessFeedback"

function createStyles(W: WellnessPalette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: W.bg },
    scroll: { paddingBottom: 48, paddingHorizontal: inset },
    lead: {
      fontSize: 15,
      color: W.textMuted,
      lineHeight: 22,
      marginBottom: gapSection,
    },
    cardOuter: {
      marginBottom: gapSection,
      ...wellnessCardOuter(radiusMd),
    },
    cardInner: {
      padding: padCard,
      ...wellnessCardInner(W, radiusMd),
    },
    rowBetween: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    habitTitle: { fontSize: 16, fontWeight: "700", color: W.text, flex: 1 },
    meta: { fontSize: 13, color: W.textMuted, marginTop: 4 },
    streakPill: {
      alignSelf: "flex-start",
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      backgroundColor: W.iconBg,
    },
    streakText: { fontSize: 12, fontWeight: "800", color: W.primary },
    actions: { flexDirection: "row", gap: 8, marginTop: 12 },
    iconBtn: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
    },
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 8,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: W.primary,
    },
    addBtnDisabled: { opacity: 0.45 },
    addBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    error: { fontSize: 14, color: "#b91c1c", marginBottom: 12 },
    errorBox: {
      padding: 14,
      borderRadius: 14,
      backgroundColor: W.surfaceMuted,
      borderWidth: 1,
      borderColor: W.cardBorder,
      marginBottom: 16,
    },
    retryBtn: {
      marginTop: 12,
      alignSelf: "flex-start",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: W.primary,
    },
    retryLabel: { fontSize: 14, fontWeight: "700", color: "#fff" },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: W.text, marginBottom: 6 },
    emptySub: { fontSize: 14, color: W.textMuted, lineHeight: 20 },
    loadingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 20,
      justifyContent: "center",
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.45)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: W.bgElevated,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 32,
      borderWidth: 1,
      borderColor: W.cardBorder,
      maxHeight: "92%",
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "800",
      color: W.text,
      marginBottom: 14,
    },
    label: {
      fontSize: 12,
      fontWeight: "700",
      color: W.textMuted,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      borderWidth: 1,
      borderColor: W.cardBorder,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: W.text,
      backgroundColor: W.surfaceMuted,
      marginBottom: 12,
    },
    templateRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
    },
    chipActive: { borderColor: W.primary, backgroundColor: W.iconBg },
    chipText: { fontSize: 13, fontWeight: "600", color: W.text },
    repeatRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
    repeatBtn: {
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
    },
    repeatActive: { borderColor: W.primary, backgroundColor: W.iconBg },
    repeatLabel: { fontSize: 14, fontWeight: "600", color: W.text },
    dayRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 12 },
    dayChip: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: W.cardBorder,
      backgroundColor: W.surfaceMuted,
    },
    dayChipOn: { borderColor: W.primary, backgroundColor: W.iconBg },
    dayChipText: { fontSize: 12, fontWeight: "700", color: W.text },
    reminderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    saveRow: { flexDirection: "row", gap: 12, marginTop: 8 },
    secondaryBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: W.cardBorder,
      alignItems: "center",
      backgroundColor: W.surfaceMuted,
    },
    secondaryLabel: { fontSize: 16, fontWeight: "700", color: W.text },
  })
}

const DAY_LETTERS = ["S", "M", "T", "W", "T", "F", "S"]

function repeatSummary(h: RecurringHabit): string {
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

export default function RecurringHabitsScreen() {
  const W = useWellnessColors()
  const styles = useMemo(() => createStyles(W), [W])
  const { habits, loading, error, create, update, remove, refresh } =
    useRecurringHabitsContext()

  const safeHabits = useMemo(() => {
    if (!Array.isArray(habits)) return []
    return habits.filter(
      (h) =>
        h &&
        typeof h.id === "string" &&
        h.id.length > 0 &&
        typeof h.title === "string",
    )
  }, [habits])

  const onRetry = useCallback(() => {
    wellnessTapLight()
    void refresh()
  }, [refresh])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RecurringHabit | null>(null)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [repeatType, setRepeatType] = useState<RepeatType>("daily")
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5])
  const [reminderOn, setReminderOn] = useState(false)
  const [reminderTime, setReminderTime] = useState("09:00")
  const [saving, setSaving] = useState(false)

  function openCreate() {
    setEditing(null)
    setTitle("")
    setDescription("")
    setRepeatType("daily")
    setCustomDays([1, 2, 3, 4, 5])
    setReminderOn(false)
    setReminderTime("09:00")
    setModalOpen(true)
  }

  function openEdit(h: RecurringHabit) {
    setEditing(h)
    setTitle(h.title)
    setDescription(h.description ?? "")
    setRepeatType(h.repeatType)
    setCustomDays(
      h.repeatType === "custom" && h.repeatDays?.length ? [...h.repeatDays] : [1, 2, 3, 4, 5],
    )
    setReminderOn(!!h.reminderTime)
    setReminderTime(h.reminderTime ?? "09:00")
    setModalOpen(true)
  }

  function toggleDay(d: number) {
    setCustomDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b),
    )
  }

  async function onSave() {
    const t = title.trim()
    if (!t) {
      Alert.alert("Title", "Add a short name for this habit.")
      return
    }
    if (repeatType === "custom" && customDays.length === 0) {
      Alert.alert("Days", "Pick at least one day.")
      return
    }
    let rt = reminderTime.trim()
    if (reminderOn) {
      if (!/^\d{2}:\d{2}$/.test(rt)) {
        Alert.alert("Reminder", "Use 24h time like 09:30")
        return
      }
      const [hh, mm] = rt.split(":").map(Number)
      if (hh > 23 || mm > 59) {
        Alert.alert("Reminder", "Invalid time.")
        return
      }
    } else {
      rt = ""
    }

    setSaving(true)
    try {
      if (reminderOn) {
        await ensureNotificationPermissions()
      }
      const reminder = reminderOn ? rt : null
      const repeatDays = repeatType === "custom" ? customDays : null

      if (editing) {
        await update(editing.id, {
          title: t,
          description: description.trim() || null,
          repeatType,
          repeatDays,
          reminderTime: reminder,
          enabled: editing.enabled,
        })
      } else {
        if (safeHabits.length >= MAX_RECURRING_HABITS) {
          Alert.alert("Limit", `You can add up to ${MAX_RECURRING_HABITS} support habits.`)
          return
        }
        await create({
          title: t,
          description: description.trim() || null,
          repeatType,
          repeatDays,
          reminderTime: reminder,
          enabled: true,
        })
      }
      wellnessTapLight()
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      setModalOpen(false)
      await refresh()
    } catch (e) {
      Alert.alert("Could not save", e instanceof Error ? e.message : "Try again.")
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(h: RecurringHabit) {
    Alert.alert(
      "Remove habit",
      `Remove “${h.title}” from support habits?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            void (async () => {
              try {
                await remove(h.id)
                await refresh()
              } catch (e) {
                Alert.alert("Error", e instanceof Error ? e.message : "Try again.")
              }
            })()
          },
        },
      ],
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.lead}>
          Light reminders beside your one daily ladder task. Keep these small and optional.
        </Text>

        {error ?
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={onRetry}>
              <Text style={styles.retryLabel}>Try again</Text>
            </Pressable>
          </View>
        : null}

        {loading && safeHabits.length === 0 && !error ?
          <View style={styles.loadingRow}>
            <ActivityIndicator color={W.primary} />
            <Text style={styles.lead}>Loading support habits…</Text>
          </View>
        : null}

        {!loading && !error && safeHabits.length === 0 ?
          <View style={{ marginBottom: 16 }}>
            <Text style={styles.emptyTitle}>No support habits yet</Text>
            <Text style={styles.emptySub}>
              Add a small reminder beside your daily ladder task — optional, gentle, and easy to
              turn off.
            </Text>
          </View>
        : null}

        {safeHabits.map((h) => (
          <View key={h.id} style={styles.cardOuter}>
            <View style={styles.cardInner}>
            <View style={styles.rowBetween}>
              <Text style={styles.habitTitle}>{h.title}</Text>
              <Switch
                value={Boolean(h.enabled)}
                onValueChange={(v) => {
                  void (async () => {
                    try {
                      await update(h.id, { enabled: v })
                    } catch (e) {
                      Alert.alert(
                        "Update failed",
                        e instanceof Error ? e.message : "Could not update habit.",
                      )
                    }
                  })()
                }}
                trackColor={{ false: W.cardBorder, true: W.primary }}
              />
            </View>
            <Text style={styles.meta}>
              {repeatSummary(h)}
              {h.reminderTime ? ` · ${h.reminderTime}` : ""}
            </Text>
            {typeof h.streakCount === "number" && h.streakCount > 0 ?
              <View style={styles.streakPill}>
                <Text style={styles.streakText}>
                  {h.streakCount} day streak
                </Text>
              </View>
            : null}
            <View style={styles.actions}>
              <Pressable
                style={styles.iconBtn}
                onPress={() => {
                  wellnessTapLight()
                  openEdit(h)
                }}
              >
                <Ionicons name="create-outline" size={20} color={W.primary} />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => {
                  wellnessTapLight()
                  void onDelete(h)
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#b91c1c" />
              </Pressable>
            </View>
            </View>
          </View>
        ))}

        <Pressable
          style={({ pressed }) => [
            styles.addBtn,
            (pressed || safeHabits.length >= MAX_RECURRING_HABITS) &&
              styles.addBtnDisabled,
          ]}
          disabled={safeHabits.length >= MAX_RECURRING_HABITS}
          onPress={() => {
            wellnessTapLight()
            openCreate()
          }}
        >
          <Ionicons name="add-circle-outline" size={22} color="#fff" />
          <Text style={styles.addBtnText}>Add support habit</Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={modalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={{ flex: 1 }} onPress={() => setModalOpen(false)} />
          <View style={styles.modalCard}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editing ? "Edit habit" : "New support habit"}
              </Text>

              <Text style={styles.label}>Quick picks</Text>
              <View style={styles.templateRow}>
                {HABIT_TEMPLATES.map((tm) => (
                  <Pressable
                    key={tm.title}
                    style={({ pressed }) => [
                      styles.chip,
                      title === tm.title && styles.chipActive,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => {
                      setTitle(tm.title)
                      setDescription(tm.description)
                    }}
                  >
                    <Text style={styles.chipText}>{tm.title}</Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Drink water"
                placeholderTextColor={W.textMuted}
              />

              <Text style={styles.label}>Note (optional)</Text>
              <TextInput
                style={[styles.input, { minHeight: 72 }]}
                value={description}
                onChangeText={setDescription}
                placeholder="One line of encouragement"
                placeholderTextColor={W.textMuted}
                multiline
              />

              <Text style={styles.label}>Repeat</Text>
              <View style={styles.repeatRow}>
                {(
                  [
                    ["daily", "Daily"],
                    ["weekdays", "Weekdays"],
                    ["custom", "Custom"],
                  ] as const
                ).map(([v, label]) => (
                  <Pressable
                    key={v}
                    style={[styles.repeatBtn, repeatType === v && styles.repeatActive]}
                    onPress={() => setRepeatType(v)}
                  >
                    <Text style={styles.repeatLabel}>{label}</Text>
                  </Pressable>
                ))}
              </View>

              {repeatType === "custom" ?
                <>
                  <Text style={styles.label}>Days</Text>
                  <View style={styles.dayRow}>
                    {DAY_LETTERS.map((letter, d) => (
                      <Pressable
                        key={d}
                        style={[
                          styles.dayChip,
                          customDays.includes(d) && styles.dayChipOn,
                        ]}
                        onPress={() => toggleDay(d)}
                      >
                        <Text style={styles.dayChipText}>{letter}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              : null}

              <View style={styles.reminderRow}>
                <Text style={styles.repeatLabel}>Reminder</Text>
                <Switch
                  value={reminderOn}
                  onValueChange={setReminderOn}
                  trackColor={{ false: W.cardBorder, true: W.primary }}
                />
              </View>
              {reminderOn ?
                <>
                  <Text style={styles.label}>Time (24h)</Text>
                  <TextInput
                    style={styles.input}
                    value={reminderTime}
                    onChangeText={setReminderTime}
                    placeholder="09:30"
                    placeholderTextColor={W.textMuted}
                    keyboardType="numbers-and-punctuation"
                  />
                </>
              : null}

              <View style={styles.saveRow}>
                <Pressable style={styles.secondaryBtn} onPress={() => setModalOpen(false)}>
                  <Text style={styles.secondaryLabel}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[
                    styles.addBtn,
                    { flex: 1, marginTop: 0 },
                    saving && styles.addBtnDisabled,
                  ]}
                  disabled={saving}
                  onPress={() => void onSave()}
                >
                  <Text style={styles.addBtnText}>{saving ? "Saving…" : "Save"}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}
