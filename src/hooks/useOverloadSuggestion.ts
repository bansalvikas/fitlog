import { useMemo } from 'react'
import type { Workout, WorkoutEntry } from '../types'

export interface OverloadSuggestion {
  type: 'increase_weight' | 'increase_reps' | 'add_set'
  message: string
}

/**
 * Analyzes recent workout history to suggest progressive overload for an exercise.
 */
function getOverloadSuggestion(
  exerciseId: string,
  workouts: Workout[]
): OverloadSuggestion | null {
  const sessions: { bestWeight: number; totalCompletedSets: number; maxReps: number }[] = []

  for (const w of workouts) {
    if (w.status !== 'completed') continue
    const entry = w.entries.find((e) => e.exerciseId === exerciseId)
    if (!entry || entry.sets.length === 0) continue

    const completedSets = entry.sets.filter((s) => s.completed)
    if (completedSets.length === 0) continue

    const bestWeight = Math.max(...completedSets.map((s) => s.weight))
    const maxReps = Math.max(...completedSets.map((s) => s.reps))

    sessions.push({
      bestWeight,
      totalCompletedSets: completedSets.length,
      maxReps,
    })

    if (sessions.length >= 3) break
  }

  if (sessions.length < 2) return null

  const currentWeight = sessions[0].bestWeight
  const currentReps = sessions[0].maxReps
  const currentSets = sessions[0].totalCompletedSets
  const sessionsAtWeight = sessions.filter((s) => s.bestWeight === currentWeight).length

  if (sessionsAtWeight >= 2 && currentReps >= 8 && currentSets >= 3) {
    return {
      type: 'increase_weight',
      message: `You've hit ${currentWeight}kg × ${currentReps} for ${sessionsAtWeight} sessions — try ${currentWeight + 2.5}kg`,
    }
  }

  if (sessionsAtWeight >= 2 && currentReps < 12 && currentSets >= 3) {
    return {
      type: 'increase_reps',
      message: `Solid at ${currentWeight}kg — aim for ${currentReps + 1} reps this session`,
    }
  }

  if (sessionsAtWeight >= 2 && currentSets < 4) {
    return {
      type: 'add_set',
      message: `Try adding an extra set at ${currentWeight}kg before increasing weight`,
    }
  }

  return null
}

/**
 * Compute overload suggestions for all entries in the current workout.
 * Returns a map of exerciseId → suggestion.
 */
export function useOverloadSuggestions(
  entries: WorkoutEntry[],
  workouts: Workout[]
): Map<string, OverloadSuggestion> {
  return useMemo(() => {
    const map = new Map<string, OverloadSuggestion>()
    for (const entry of entries) {
      if (entry.logMode !== 'sets_reps_weight') continue
      const suggestion = getOverloadSuggestion(entry.exerciseId, workouts)
      if (suggestion) map.set(entry.exerciseId, suggestion)
    }
    return map
  }, [entries, workouts])
}
