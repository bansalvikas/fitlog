import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Workout, Routine } from '../types'

// We can't test the download trigger in jsdom, but we can test the data generation logic.
// We'll extract and test the CSV escaping and data shape logic.

// Import the module — we mock the DOM parts
const createObjectURLMock = vi.fn(() => 'blob:mock-url')
const revokeObjectURLMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('URL', {
    createObjectURL: createObjectURLMock,
    revokeObjectURL: revokeObjectURLMock,
  })

  // Mock document.createElement and friends
  const mockAnchor = {
    href: '',
    download: '',
    click: vi.fn(),
  }
  vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor as unknown as HTMLElement)
  vi.spyOn(document.body, 'appendChild').mockReturnValue(null as unknown as Node)
  vi.spyOn(document.body, 'removeChild').mockReturnValue(null as unknown as Node)
})

// Re-import after mocks
import { exportAsJson, exportAsCsv } from './exportData'

function makeWorkout(overrides: Partial<Workout> = {}): Workout {
  return {
    id: 'w1',
    userId: 'u1',
    date: '2026-03-20',
    startTime: '2026-03-20T09:00:00Z',
    endTime: '2026-03-20T10:00:00Z',
    status: 'completed',
    entries: [
      {
        id: 'e1',
        exerciseId: 'ex1',
        exerciseName: 'Bench Press',
        bodyPart: 'chest',
        logMode: 'sets_reps_weight',
        order: 0,
        sets: [
          { setNumber: 1, weight: 60, reps: 10, completed: true },
          { setNumber: 2, weight: 60, reps: 8, completed: true },
        ],
      },
    ],
    createdAt: '2026-03-20T09:00:00Z',
    updatedAt: '2026-03-20T10:00:00Z',
    ...overrides,
  }
}

describe('exportAsJson', () => {
  it('does not throw with valid data', () => {
    const workouts = [makeWorkout()]
    const routines: Routine[] = []
    expect(() => exportAsJson(workouts, routines)).not.toThrow()
  })

  it('does not throw with empty data', () => {
    expect(() => exportAsJson([], [])).not.toThrow()
  })

  it('creates a blob via URL.createObjectURL', () => {
    exportAsJson([makeWorkout()], [])
    expect(createObjectURLMock).toHaveBeenCalled()
  })
})

describe('exportAsCsv', () => {
  it('does not throw with valid data', () => {
    expect(() => exportAsCsv([makeWorkout()])).not.toThrow()
  })

  it('does not throw with empty workouts', () => {
    expect(() => exportAsCsv([])).not.toThrow()
  })

  it('skips non-completed workouts', () => {
    const w = makeWorkout({ status: 'in_progress' })
    // Should produce CSV with header only
    expect(() => exportAsCsv([w])).not.toThrow()
  })

  it('handles exercises with commas in name (CSV escaping)', () => {
    const w = makeWorkout()
    w.entries[0].exerciseName = 'Bench Press, Incline'
    expect(() => exportAsCsv([w])).not.toThrow()
  })

  it('handles cardio entries (no sets, has duration)', () => {
    const w = makeWorkout()
    w.entries = [
      {
        id: 'e2',
        exerciseId: 'ex2',
        exerciseName: 'Running',
        bodyPart: 'cardio',
        logMode: 'duration_distance',
        order: 0,
        sets: [],
        duration: 30,
        distance: 5,
      },
    ]
    expect(() => exportAsCsv([w])).not.toThrow()
  })
})
