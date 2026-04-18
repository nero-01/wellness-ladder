/** Mobile daily task catalog — keep in sync with `lib/wellness-data.ts`. */

export type TaskTimerMode = "countdown" | "manual"

export interface Task {
  id: number
  title: string
  instruction: string
  duration: number
  icon: string
  /** Default is countdown; manual = user starts/stops (e.g. mindful walk). */
  timerMode?: TaskTimerMode
  /** For manual tasks: minimum seconds walked after Stop before Done is enabled. */
  manualMinSeconds?: number
}

export function isManualTimerTask(task: Task): boolean {
  return task.timerMode === "manual"
}

export const WELLNESS_TASKS: Task[] = [
  { id: 1, title: "Take 3 Deep Breaths", instruction: "In... hold... out.", duration: 30, icon: "\u{1F32C}" },
  {
    id: 2,
    title: "Gratitude Moment",
    instruction:
      "Name three things you are grateful for today—big or small. Pause for a few breaths on each one.",
    duration: 60,
    icon: "\u{1F64F}",
  },
  {
    id: 3,
    title: "Gentle Stretch",
    instruction:
      "Stand or sit tall. Interlace your fingers, turn palms up, and reach gently toward the ceiling. Keep shoulders soft and ribs stacked—no flaring. Hold where it feels easy, breathe, then release slowly and roll shoulders open.",
    duration: 35,
    icon: "\u{1F9D8}",
  },
  {
    id: 4,
    title: "Mindful Walk",
    instruction:
      "Walk slowly and notice lifting and placing each foot. Tap Start walk when you begin moving and Stop walk when you finish—the timer runs only while you walk. Even ten mindful steps count.",
    duration: 60,
    icon: "\u{1F6B6}",
    timerMode: "manual",
    manualMinSeconds: 15,
  },
  { id: 5, title: "Quick Journal", instruction: "Mentally note one feeling you have right now.", duration: 30, icon: "\u{1F4DD}" },
  { id: 6, title: "Hydration Check", instruction: "Take a sip of water. Stay hydrated!", duration: 15, icon: "\u{1F4A7}" },
  { id: 7, title: "Reflect & Rest", instruction: "Close your eyes and breathe slowly.", duration: 45, icon: "\u{1F31F}" },
  { id: 8, title: "Shoulder Release", instruction: "Roll your shoulders up, back, and down—slowly, five times.", duration: 30, icon: "\u{1F4AA}" },
  { id: 9, title: "Screen Break", instruction: "Look away from any screen. Rest your eyes on something arm’s length or farther.", duration: 45, icon: "\u{1F4F4}" },
  { id: 10, title: "Gentle Self-Words", instruction: "Say one short kind sentence to yourself, out loud or in your head.", duration: 25, icon: "\u{2728}" },
  { id: 11, title: "Easy Neck Care", instruction: "Let your ear drift toward each shoulder—no forcing, small and slow.", duration: 35, icon: "\u{2195}\u{FE0F}" },
  { id: 12, title: "Green Glance", instruction: "Find something natural—a plant, tree, or sky—and notice one color or texture.", duration: 40, icon: "\u{1F331}" },
  { id: 13, title: "Posture Reset", instruction: "Sit or stand tall, feet grounded, jaw unclenched, shoulders dropped.", duration: 30, icon: "\u{1F9CD}" },
  { id: 14, title: "Wrist & Hand Wake-Up", instruction: "Circle wrists slowly in both directions, then spread and close fingers a few times.", duration: 25, icon: "\u{270B}" },
  { id: 15, title: "Listening Pause", instruction: "Stay still and name one sound you hear—near or far, no judgment.", duration: 40, icon: "\u{1F442}" },
  { id: 16, title: "Soft Smile", instruction: "Relax your face and lift the corners of your mouth slightly—hold it soft and easy.", duration: 20, icon: "\u{1F60A}" },
  { id: 17, title: "Ground Through Feet", instruction: "Feel soles on the floor. Shift weight slightly side to side, then stand balanced.", duration: 35, icon: "\u{1F9B6}" },
  { id: 18, title: "Upper Back Open", instruction: "Reach arms wide or gently clasp hands behind you; open chest, breathe wide.", duration: 40, icon: "\u{1F9D1}" },
  { id: 19, title: "Mindful Sip", instruction: "If you have a drink nearby, take one slow sip—notice temperature and swallow.", duration: 30, icon: "\u{2615}" },
  { id: 20, title: "Shoulder Blade Squeeze", instruction: "Draw shoulder blades gently toward each other; hold a few seconds, then release.", duration: 30, icon: "\u{1F9B4}" },
  { id: 21, title: "Jaw Release", instruction: "Let teeth part slightly, tongue rest on the roof of the mouth, exhale through the nose.", duration: 25, icon: "\u{1F9B7}" },
  { id: 22, title: "Finger Spreads", instruction: "Spread fingers wide on a table or thigh, then relax—repeat slowly.", duration: 20, icon: "\u{270C}\u{FE0F}" },
  { id: 23, title: "Distant Focus", instruction: "Gaze at something far away for a few breaths—soft eyes, blink naturally.", duration: 35, icon: "\u{1F441}\u{FE0F}" },
  { id: 24, title: "One Thankful Breath", instruction: "Inhale gently; exhale with one silent word of thanks.", duration: 25, icon: "\u{1F49A}" },
  { id: 25, title: "Tomorrow’s First Step", instruction: "Picture one small thing you could do tomorrow to care for yourself.", duration: 40, icon: "\u{1F31E}" },
]

export function getTodayTask(streakDay: number): Task {
  const index = (streakDay - 1) % WELLNESS_TASKS.length
  return WELLNESS_TASKS[index]
}

/**
 * Task 1: three breaths across the full timer. Each breath is split into
 * in / hold / out so the last seconds show “Breathe out” (unlike a fixed 12s
 * modulo cycle on a 30s task, which ends on “Hold”).
 */
export function getBreathingPhaseLabel(
  taskId: number,
  duration: number,
  timeLeft: number,
): string | null {
  if (taskId !== 1 || duration <= 0) return null
  const elapsed = Math.max(0, duration - timeLeft)
  const breathCycle = Math.floor(duration / 3)
  if (breathCycle < 1) return null
  const phaseLen = breathCycle / 3
  const pos = elapsed % breathCycle
  if (pos < phaseLen) return "Breathe in..."
  if (pos < 2 * phaseLen) return "Hold..."
  return "Breathe out..."
}

export interface StreakData {
  currentStreak: number
  lastCompletedDate: string | null
  totalCompleted: number
  moodHistory: { date: string; mood: number }[]
  completionHistory: { date: string; taskId: number }[]
}

export const DEFAULT_STREAK_DATA: StreakData = {
  currentStreak: 0,
  lastCompletedDate: null,
  totalCompleted: 0,
  moodHistory: [],
  completionHistory: [],
}
