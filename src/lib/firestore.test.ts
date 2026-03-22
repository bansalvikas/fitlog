/**
 * Tests for Firestore data layer — static analysis and type safety checks.
 * (We can't test actual Firestore calls without an emulator, but we verify
 *  the code structure, error handling, and data model consistency.)
 */
import { describe, it, expect } from 'vitest'
import type { Workout, Routine, WorkoutEntry } from '../types'

// ── Data Model Integrity Tests ───────────────────────────────────────

describe('Data Model Integrity', () => {
  it('Workout type has all required fields for Firestore storage', () => {
    const workout: Workout = {
      id: 'w1',
      userId: 'u1',
      date: '2026-03-20',
      startTime: '2026-03-20T09:00:00Z',
      status: 'in_progress',
      entries: [],
      createdAt: '2026-03-20T09:00:00Z',
      updatedAt: '2026-03-20T09:00:00Z',
    }
    expect(workout.id).toBeTruthy()
    expect(workout.userId).toBeTruthy()
  })

  it('WorkoutEntry has exerciseId for Smart Recall lookups', () => {
    const entry: WorkoutEntry = {
      id: 'e1',
      exerciseId: 'bench-press',
      exerciseName: 'Bench Press',
      bodyPart: 'chest',
      logMode: 'sets_reps_weight',
      order: 0,
      sets: [],
    }
    expect(entry.exerciseId).toBeTruthy()
  })

  it('Routine type has daysOfWeek for schedule matching', () => {
    const routine: Routine = {
      id: 'r1',
      userId: 'u1',
      name: 'Push Day',
      daysOfWeek: [1, 3, 5],
      exercises: [],
      createdAt: '2026-03-20T09:00:00Z',
      updatedAt: '2026-03-20T09:00:00Z',
    }
    expect(routine.daysOfWeek).toContain(1)
    expect(routine.daysOfWeek).toContain(3)
    expect(routine.daysOfWeek).toContain(5)
  })
})

// ── Firestore Security Rules Static Analysis ─────────────────────────

describe('Firestore Security Rules Analysis', () => {
  // We read the rules file content and verify key patterns
  it('rules file enforces auth check on all paths', async () => {
    const fs = await import('fs')
    const rules = fs.readFileSync('/Users/vikas.bansal/fitlog/firestore.rules', 'utf-8')

    // Verify auth checks exist
    expect(rules).toContain('request.auth != null')
    expect(rules).toContain('request.auth.uid == userId')

    // Verify all collection paths are covered
    expect(rules).toContain('/users/{userId}')
    expect(rules).toContain('/workouts/{workoutId}')
    expect(rules).toContain('/entries/{entryId}')
    expect(rules).toContain('/routines/{routineId}')
  })

  it('rules do not have any wildcard allow-all patterns', async () => {
    const fs = await import('fs')
    const rules = fs.readFileSync('/Users/vikas.bansal/fitlog/firestore.rules', 'utf-8')

    // Should NOT have blanket allow
    expect(rules).not.toContain('allow read, write: if true')
    expect(rules).not.toContain('allow read, write;')
    expect(rules).not.toMatch(/allow\s+(read|write).*if\s+true/)
  })

  it('rules do not expose data outside user namespace', async () => {
    const fs = await import('fs')
    const rules = fs.readFileSync('/Users/vikas.bansal/fitlog/firestore.rules', 'utf-8')

    // All rules should be nested under /users/{userId}
    // There should be no top-level collection access
    const lines = rules.split('\n').filter((l: string) => l.includes('allow'))
    for (const line of lines) {
      expect(line).toContain('request.auth.uid == userId')
    }
  })
})

// ── saveWorkoutToFirestore structure analysis ────────────────────────

describe('Firestore CRUD structure', () => {
  it('saveWorkoutToFirestore uses batch writes for atomicity', async () => {
    const source = await import('fs')
    const code = source.readFileSync('/Users/vikas.bansal/fitlog/src/lib/firestore.ts', 'utf-8')

    // Should use writeBatch
    expect(code).toContain('writeBatch(db)')
    // Destructuring should separate entries
    expect(code).toContain('const { entries, ...workoutData } = workout')
    // Should use batch.set with stripUndefined to clean data
    expect(code).toContain('batch.set(workoutRef, stripUndefined(workoutData))')
    // Should iterate and save entries separately
    expect(code).toContain('for (const entry of entries)')
    // Should commit batch
    expect(code).toContain('batch.commit()')
  })

  it('deleteWorkoutFromFirestore uses batch deletes for atomicity', async () => {
    const source = await import('fs')
    const code = source.readFileSync('/Users/vikas.bansal/fitlog/src/lib/firestore.ts', 'utf-8')

    const deleteSection = code.substring(code.indexOf('deleteWorkoutFromFirestore'))
    // Should use batch.delete for entries
    expect(deleteSection).toContain('batch.delete(entryDoc.ref)')
    // Should commit batch
    expect(deleteSection).toContain('batch.commit()')
  })

  it('subscribeToWorkouts loads entries for each workout', async () => {
    const source = await import('fs')
    const code = source.readFileSync('/Users/vikas.bansal/fitlog/src/lib/firestore.ts', 'utf-8')

    // Subscription should load entries subcollection
    const subscribeSection = code.substring(code.indexOf('subscribeToWorkouts'))
    expect(subscribeSection).toContain('entries')
    expect(subscribeSection).toContain('getDocs')
  })

  it('subscriptions have error handlers', async () => {
    const source = await import('fs')
    const code = source.readFileSync('/Users/vikas.bansal/fitlog/src/lib/firestore.ts', 'utf-8')

    // Both subscriptions should have error callbacks
    expect(code).toContain('Workout subscription error')
    expect(code).toContain('Routine subscription error')
  })

  it('uses parallel entry loading in subscribeToWorkouts', async () => {
    const source = await import('fs')
    const code = source.readFileSync('/Users/vikas.bansal/fitlog/src/lib/firestore.ts', 'utf-8')

    const subscribeSection = code.substring(code.indexOf('subscribeToWorkouts'))
    expect(subscribeSection).toContain('Promise.all')
  })
})
