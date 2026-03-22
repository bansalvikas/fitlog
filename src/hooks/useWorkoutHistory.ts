import { useState, useCallback, useMemo, useEffect } from 'react'
import type { Workout, WorkoutSummary } from '../types'
import { calculateVolume } from '../lib/utils'
import { useAuth } from './useAuth'
import {
  saveWorkoutToFirestore,
  deleteWorkoutFromFirestore,
  subscribeToWorkouts,
} from '../lib/firestore'

export function useWorkoutHistory() {
  const { user } = useAuth()
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  // Subscribe to Firestore workouts for current user
  useEffect(() => {
    if (!user) {
      setWorkouts([])
      setLoading(false)
      return
    }

    setLoading(true)
    const unsubscribe = subscribeToWorkouts(user.uid, (data) => {
      setWorkouts(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [user])

  const saveWorkout = useCallback(
    async (workout: Workout) => {
      if (!user) return
      // Optimistic update
      setWorkouts((prev) => [workout, ...prev.filter((w) => w.id !== workout.id)])
      await saveWorkoutToFirestore(user.uid, workout)
    },
    [user]
  )

  const deleteWorkout = useCallback(
    async (id: string) => {
      if (!user) return
      setWorkouts((prev) => prev.filter((w) => w.id !== id))
      await deleteWorkoutFromFirestore(user.uid, id)
    },
    [user]
  )

  const getWorkoutById = useCallback(
    (id: string) => workouts.find((w) => w.id === id) ?? null,
    [workouts]
  )

  const summaries = useMemo((): WorkoutSummary[] => {
    return workouts
      .filter((w) => w.status === 'completed')
      .map((w) => {
        const durationMs = w.endTime
          ? new Date(w.endTime).getTime() - new Date(w.startTime).getTime()
          : 0
        return {
          id: w.id,
          date: w.date,
          routineName: w.routineName,
          duration: Math.round(durationMs / 60000),
          exerciseCount: w.entries.length,
          totalSets: w.entries.reduce(
            (sum, e) => sum + e.sets.filter((s) => s.completed).length,
            0
          ),
          totalVolume: calculateVolume(w.entries),
        }
      })
  }, [workouts])

  const weekWorkoutCount = useMemo(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)

    return workouts.filter((w) => {
      const wDate = new Date(w.date)
      return w.status === 'completed' && wDate >= weekStart
    }).length
  }, [workouts])

  /** Smart Recall: find the most recent entry for a given exercise from completed workouts */
  const getLastExerciseData = useCallback(
    (exerciseId: string) => {
      for (const w of workouts) {
        if (w.status !== 'completed') continue
        const entry = w.entries.find((e) => e.exerciseId === exerciseId)
        if (entry) {
          return {
            sets: entry.sets.filter((s) => s.completed),
            duration: entry.duration,
            distance: entry.distance,
          }
        }
      }
      return null
    },
    [workouts]
  )

  return {
    workouts,
    summaries,
    weekWorkoutCount,
    loading,
    saveWorkout,
    deleteWorkout,
    getWorkoutById,
    getLastExerciseData,
  }
}
