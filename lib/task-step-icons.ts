/**
 * Themed ladder-step icons (no emoji). Cycles for long task catalogs.
 * Names are Ionicons glyph keys — keep in sync with web `task-step-icon.tsx`.
 */
export const TASK_STEP_IONICONS = [
  "leaf-outline",
  "heart-outline",
  "body-outline",
  "footsteps-outline",
  "journal-outline",
  "water-outline",
  "moon-outline",
  "accessibility-outline",
  "phone-portrait-outline",
  "sparkles-outline",
  "move-outline",
  "sunny-outline",
] as const

export type TaskStepIoniconName = (typeof TASK_STEP_IONICONS)[number]

export function taskStepIconIndex(taskId: number): number {
  if (!Number.isFinite(taskId) || taskId < 1) return 0
  return (taskId - 1) % TASK_STEP_IONICONS.length
}

export function taskStepIoniconName(taskId: number): TaskStepIoniconName {
  return TASK_STEP_IONICONS[taskStepIconIndex(taskId)] ?? TASK_STEP_IONICONS[0]
}
