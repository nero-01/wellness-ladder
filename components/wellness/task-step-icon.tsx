"use client"

import {
  Accessibility,
  Footprints,
  Heart,
  Leaf,
  Moon,
  Phone,
  Sparkles,
  Sun,
  Waves,
  BookOpen,
  MoveRight,
  Dumbbell,
} from "lucide-react"
import { taskStepIconIndex } from "@/lib/task-step-icons"

const LUCIDE_ICONS = [
  Leaf,
  Heart,
  Dumbbell,
  Footprints,
  BookOpen,
  Waves,
  Moon,
  Accessibility,
  Phone,
  Sparkles,
  MoveRight,
  Sun,
] as const

type Props = {
  taskId: number
  size: number
  className?: string
}

/** Replaces remote emoji SVG for task steps — matches mobile `TaskStepIconWell` rhythm. */
export function TaskStepIcon({ taskId, size, className }: Props) {
  const i = taskStepIconIndex(taskId) % LUCIDE_ICONS.length
  const Icon = LUCIDE_ICONS[i] ?? Leaf
  return <Icon size={size} className={className ?? "text-primary"} strokeWidth={1.75} />
}
