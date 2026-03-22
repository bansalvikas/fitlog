import { useState, useCallback, useMemo } from 'react'
import type { Workout, WorkoutSummary } from '../types'
import { calculateVolume } from '../lib/utils'

const STORAGE_KEY = 'fitlog-workouts'

function loadWorkouts(): Workout[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistWorkouts(workouts: Workout[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts))
}

export function useWorkoutHistory() {
  const [workouts, setWorkouts] = useState<Workout[]>(loadWorkouts)

  const saveWorkout = useCallback(
    (workout: Workout) => {
      const updated = [workout, ...workouts.filter((w) => w.id !== workout.id)]
      setWorkouts(updated)
      persistWorkouts(updated)
    },
    [workouts]
  )

  const deleteWorkout = useCallback(
    (id: string) => {
      const updated = workouts.filter((w) => w.id !== id)
      setWorkouts(updated)
      persistWorkouts(updated)
    },
    [workouts]
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
    weekStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0)

    return workouts.filter((w) => {
      const wDate = new Date(w.date)
      return w.status === 'completed' && wDate >= weekStart
    }).length
  }, [workouts])

  return {
    workouts,
    summaries,
    weekWorkoutCount,
    saveWorkout,
    deleteWorkout,
    getWorkoutById,
  }
}
