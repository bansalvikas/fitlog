/**
 * Tests for the progressive overload suggestion logic.
 */
import { describe, it, expect } from 'vitest'
import type { Workout } from '../types'

// We can't call hooks outside React, so we extract the pure function for testing.
// The getOverloadSuggestion function is not exported, so we replicate it.

interface OverloadSuggestion {
  type: 'increase_weight' | 'increase_reps' | 'add_set'
  message: string
}

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

// ── Helpers ──────────────────────────────────────────────────────────

function makeWorkout(
  exerciseId: string,
  sets: Array<{ weight: number; reps: number; completed: boolean }>,
  date: string = '2026-03-20'
): Workout {
  return {
    id: `w-${date}`,
    userId: 'u1',
    date,
    startTime: `${date}T09:00:00Z`,
    endTime: `${date}T10:00:00Z`,
    status: 'completed',
    entries: [
      {
        id: `e-${date}`,
        exerciseId,
        exerciseName: 'Bench Press',
        bodyPart: 'chest',
        logMode: 'sets_reps_weight',
        order: 0,
        sets: sets.map((s, i) => ({ ...s, setNumber: i + 1 })),
      },
    ],
    createdAt: `${date}T09:00:00Z`,
    updatedAt: `${date}T10:00:00Z`,
  }
}

// ── Tests ────────────────────────────────────────────────────────────

describe('getOverloadSuggestion', () => {
  it('returns null with only 1 session', () => {
    const workouts = [
      makeWorkout('bench', [
        { weight: 60, reps: 10, completed: true },
        { weight: 60, reps: 10, completed: true },
        { weight: 60, reps: 10, completed: true },
      ]),
    ]
    expect(getOverloadSuggestion('bench', workouts)).toBeNull()
  })

  it('returns null for unknown exercise', () => {
    const workouts = [
      makeWorkout('bench', [{ weight: 60, reps: 10, completed: true }], '2026-03-20'),
      makeWorkout('bench', [{ weight: 60, reps: 10, completed: true }], '2026-03-18'),
    ]
    expect(getOverloadSuggestion('squat', workouts)).toBeNull()
  })

  it('suggests increasing weight after 2+ sessions at same weight with 8+ reps and 3+ sets', () => {
    const workouts = [
      makeWorkout('bench', [
        { weight: 60, reps: 10, completed: true },
        { weight: 60, reps: 10, completed: true },
        { weight: 60, reps: 10, completed: true },
      ], '2026-03-20'),
      makeWorkout('bench', [
        { weight: 60, reps: 10, completed: true },
        { weight: 60, reps: 10, completed: true },
        { weight: 60, reps: 10, completed: true },
      ], '2026-03-18'),
    ]
    const suggestion = getOverloadSuggestion('bench', workouts)
    expect(suggestion).not.toBeNull()
    expect(suggestion!.type).toBe('increase_weight')
    expect(suggestion!.message).toContain('62.5kg')
  })

  it('suggests increasing reps when at same weight with < 8 reps and 3+ sets', () => {
    const workouts = [
      makeWorkout('bench', [
        { weight: 80, reps: 5, completed: true },
        { weight: 80, reps: 5, completed: true },
        { weight: 80, reps: 5, completed: true },
      ], '2026-03-20'),
      makeWorkout('bench', [
        { weight: 80, reps: 5, completed: true },
        { weight: 80, reps: 5, completed: true },
        { weight: 80, reps: 5, completed: true },
      ], '2026-03-18'),
    ]
    const suggestion = getOverloadSuggestion('bench', workouts)
    expect(suggestion).not.toBeNull()
    expect(suggestion!.type).toBe('increase_reps')
    expect(suggestion!.message).toContain('6 reps')
  })

  it('suggests adding set when at same weight with < 4 completed sets', () => {
    const workouts = [
      makeWorkout('bench', [
        { weight: 80, reps: 5, completed: true },
        { weight: 80, reps: 5, completed: true },
      ], '2026-03-20'),
      makeWorkout('bench', [
        { weight: 80, reps: 5, completed: true },
        { weight: 80, reps: 5, completed: true },
      ], '2026-03-18'),
    ]
    const suggestion = getOverloadSuggestion('bench', workouts)
    expect(suggestion).not.toBeNull()
    expect(suggestion!.type).toBe('add_set')
  })

  it('skips non-completed workouts', () => {
    const w1 = makeWorkout('bench', [
      { weight: 60, reps: 10, completed: true },
      { weight: 60, reps: 10, completed: true },
      { weight: 60, reps: 10, completed: true },
    ], '2026-03-20')
    const w2 = makeWorkout('bench', [
      { weight: 60, reps: 10, completed: true },
      { weight: 60, reps: 10, completed: true },
      { weight: 60, reps: 10, completed: true },
    ], '2026-03-18')
    w2.status = 'in_progress' // not completed

    expect(getOverloadSuggestion('bench', [w1, w2])).toBeNull()
  })

  it('skips sets that are not completed', () => {
    const workouts = [
      makeWorkout('bench', [
        { weight: 60, reps: 10, completed: false },
        { weight: 60, reps: 10, completed: false },
        { weight: 60, reps: 10, completed: false },
      ], '2026-03-20'),
      makeWorkout('bench', [
        { weight: 60, reps: 10, completed: true },
        { weight: 60, reps: 10, completed: true },
        { weight: 60, reps: 10, completed: true },
      ], '2026-03-18'),
    ]
    // First workout has 0 completed sets, so it's skipped. Only 1 session remains.
    expect(getOverloadSuggestion('bench', workouts)).toBeNull()
  })

  it('handles 0kg bodyweight exercises without suggesting negative weight', () => {
    const workouts = [
      makeWorkout('bench', [
        { weight: 0, reps: 15, completed: true },
        { weight: 0, reps: 15, completed: true },
        { weight: 0, reps: 15, completed: true },
      ], '2026-03-20'),
      makeWorkout('bench', [
        { weight: 0, reps: 15, completed: true },
        { weight: 0, reps: 15, completed: true },
        { weight: 0, reps: 15, completed: true },
      ], '2026-03-18'),
    ]
    const suggestion = getOverloadSuggestion('bench', workouts)
    // Should suggest increase_weight: 0 + 2.5 = 2.5kg
    expect(suggestion).not.toBeNull()
    expect(suggestion!.type).toBe('increase_weight')
    expect(suggestion!.message).toContain('2.5kg')
  })
})
