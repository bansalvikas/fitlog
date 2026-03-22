import { useState, useCallback, useMemo } from 'react'
import type { Routine, RoutineExercise, DayOfWeek } from '../types'
import { generateId, getDayOfWeek } from '../lib/utils'

// In-memory storage for development. Will be replaced with Firestore.
const STORAGE_KEY = 'fitlog-routines'

function loadRoutines(): Routine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveRoutines(routines: Routine[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(routines))
}

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>(loadRoutines)

  const createRoutine = useCallback(
    (name: string, daysOfWeek: DayOfWeek[], exercises: RoutineExercise[]) => {
      const now = new Date().toISOString()
      const routine: Routine = {
        id: generateId(),
        userId: 'dev-user',
        name,
        daysOfWeek,
        exercises,
        createdAt: now,
        updatedAt: now,
      }
      const updated = [...routines, routine]
      setRoutines(updated)
      saveRoutines(updated)
      return routine
    },
    [routines]
  )

  const updateRoutine = useCallback(
    (id: string, updates: Partial<Pick<Routine, 'name' | 'daysOfWeek' | 'exercises'>>) => {
      const updated = routines.map((r) =>
        r.id === id
          ? { ...r, ...updates, updatedAt: new Date().toISOString() }
          : r
      )
      setRoutines(updated)
      saveRoutines(updated)
    },
    [routines]
  )

  const deleteRoutine = useCallback(
    (id: string) => {
      const updated = routines.filter((r) => r.id !== id)
      setRoutines(updated)
      saveRoutines(updated)
    },
    [routines]
  )

  const todayRoutine = useMemo(() => {
    const today = getDayOfWeek() as DayOfWeek
    return routines.find((r) => r.daysOfWeek.includes(today)) ?? null
  }, [routines])

  const getRoutineById = useCallback(
    (id: string) => routines.find((r) => r.id === id) ?? null,
    [routines]
  )

  return {
    routines,
    todayRoutine,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    getRoutineById,
  }
}
