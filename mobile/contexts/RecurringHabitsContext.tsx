import React, { createContext, useContext, type ReactNode } from "react"
import { useRecurringHabits } from "@/hooks/useRecurringHabits"

type Ctx = ReturnType<typeof useRecurringHabits> | null

const RecurringHabitsContext = createContext<Ctx>(null)

export function RecurringHabitsProvider({ children }: { children: ReactNode }) {
  const value = useRecurringHabits()
  return (
    <RecurringHabitsContext.Provider value={value}>
      {children}
    </RecurringHabitsContext.Provider>
  )
}

export function useRecurringHabitsContext(): ReturnType<typeof useRecurringHabits> {
  const ctx = useContext(RecurringHabitsContext)
  if (!ctx) {
    throw new Error("useRecurringHabitsContext must be used within RecurringHabitsProvider")
  }
  return ctx
}
