import { useMemo } from 'react'
import type { ProgressDataPoint, CardioProgressDataPoint } from '../types'
import { useWorkoutHistory } from './useWorkoutHistory'

export function useProgressData(exerciseId: string | null) {
  const { workouts } = useWorkoutHistory()

  const strengthData = useMemo((): ProgressDataPoint[] => {
    if (!exerciseId) return []

    const dataByDate = new Map<string, ProgressDataPoint>()

    for (const workout of workouts) {
      if (workout.status !== 'completed') continue

      for (const entry of workout.entries) {
        if (entry.exerciseId !== exerciseId) continue
        if (entry.logMode !== 'sets_reps_weight') continue

        const completedSets = entry.sets.filter((s) => s.completed)
        if (completedSets.length === 0) continue

        const bestWeight = Math.max(...completedSets.map((s) => s.weight))
        const bestReps = Math.max(...completedSets.map((s) => s.reps))
        const totalVolume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0)

        const existing = dataByDate.get(workout.date)
        if (existing) {
          dataByDate.set(workout.date, {
            date: workout.date,
            bestWeight: Math.max(existing.bestWeight, bestWeight),
            bestReps: Math.max(existing.bestReps, bestReps),
            totalVolume: existing.totalVolume + totalVolume,
          })
        } else {
          dataByDate.set(workout.date, {
            date: workout.date,
            bestWeight,
            bestReps,
            totalVolume,
          })
        }
      }
    }

    return [...dataByDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  }, [exerciseId, workouts])

  const cardioData = useMemo((): CardioProgressDataPoint[] => {
    if (!exerciseId) return []

    const dataByDate = new Map<string, CardioProgressDataPoint>()

    for (const workout of workouts) {
      if (workout.status !== 'completed') continue

      for (const entry of workout.entries) {
        if (entry.exerciseId !== exerciseId) continue
        if (entry.logMode === 'sets_reps_weight') continue

        const point: CardioProgressDataPoint = {
          date: workout.date,
          duration: entry.duration ?? 0,
          distance: entry.distance,
          pace:
            entry.distance && entry.duration
              ? entry.duration / entry.distance
              : undefined,
        }

        dataByDate.set(workout.date, point)
      }
    }

    return [...dataByDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  }, [exerciseId, workouts])

  return { strengthData, cardioData }
}
