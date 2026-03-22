import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Routine, RoutineExercise, DayOfWeek } from '../types'
import { generateId, getDayOfWeek } from '../lib/utils'
import { useAuth } from './useAuth'
import {
  saveRoutineToFirestore,
  deleteRoutineFromFirestore,
  subscribeToRoutines,
} from '../lib/firestore'

export function useRoutines() {
  const { user } = useAuth()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [loading, setLoading] = useState(true)

  const userId = user?.uid ?? null

  // Subscribe to Firestore routines for current user
  useEffect(() => {
    if (!userId) return

    let active = true
    const unsubscribe = subscribeToRoutines(userId, (data) => {
      if (active) {
        setRoutines(data)
        setLoading(false)
      }
    })

    return () => {
      active = false
      unsubscribe()
      setRoutines([])
    }
  }, [userId])

  const createRoutine = useCallback(
    async (name: string, daysOfWeek: DayOfWeek[], exercises: RoutineExercise[]) => {
      if (!user) return null
      const now = new Date().toISOString()
      const routine: Routine = {
        id: generateId(),
        userId: user.uid,
        name,
        daysOfWeek,
        exercises,
        createdAt: now,
        updatedAt: now,
      }
      // Optimistic update
      setRoutines((prev) => [routine, ...prev])
      await saveRoutineToFirestore(user.uid, routine)
      return routine
    },
    [user]
  )

  const updateRoutine = useCallback(
    async (id: string, updates: Partial<Pick<Routine, 'name' | 'daysOfWeek' | 'exercises'>>) => {
      if (!user) return
      // Use functional setState to get the latest routines and avoid stale closure
      let routineToSave: Routine | null = null
      setRoutines((prev) => {
        return prev.map((r) => {
          if (r.id !== id) return r
          const updated = { ...r, ...updates, updatedAt: new Date().toISOString() }
          routineToSave = updated
          return updated
        })
      })
      if (routineToSave) {
        await saveRoutineToFirestore(user.uid, routineToSave)
      }
    },
    [user]
  )

  const deleteRoutine = useCallback(
    async (id: string) => {
      if (!user) return
      setRoutines((prev) => prev.filter((r) => r.id !== id))
      await deleteRoutineFromFirestore(user.uid, id)
    },
    [user]
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
    loading,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    getRoutineById,
  }
}
