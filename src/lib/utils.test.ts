import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  generateId,
  formatDuration,
  formatDate,
  calculateVolume,
  getTodayDate,
  getDayOfWeek,
} from './utils'

// ── generateId ───────────────────────────────────────────────────────

describe('generateId', () => {
  it('returns a non-empty string', () => {
    const id = generateId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })

  it('returns unique IDs on successive calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

// ── formatDuration ───────────────────────────────────────────────────

describe('formatDuration', () => {
  it('formats 0 seconds as 00:00', () => {
    expect(formatDuration(0)).toBe('00:00')
  })

  it('formats seconds-only correctly', () => {
    expect(formatDuration(45)).toBe('00:45')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(125)).toBe('02:05')
  })

  it('formats hours:minutes:seconds when >= 1 hour', () => {
    expect(formatDuration(3661)).toBe('1:01:01')
  })

  it('clamps negative numbers to 00:00', () => {
    expect(formatDuration(-10)).toBe('00:00')
  })

  it('handles large numbers', () => {
    expect(formatDuration(86400)).toBe('24:00:00') // full day
  })

  it('floors non-integer seconds', () => {
    expect(formatDuration(90.5)).toBe('01:30')
  })
})

// ── formatDate ───────────────────────────────────────────────────────

describe('formatDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-22T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "Today" for today\'s date', () => {
    expect(formatDate('2026-03-22')).toBe('Today')
  })

  it('returns "Yesterday" for yesterday', () => {
    expect(formatDate('2026-03-21')).toBe('Yesterday')
  })

  it('returns "X days ago" for dates within a week', () => {
    expect(formatDate('2026-03-18')).toBe('4 days ago')
  })

  it('returns formatted date for dates older than a week in same year', () => {
    const result = formatDate('2026-01-15')
    expect(result).toMatch(/Jan/)
    expect(result).toMatch(/15/)
  })

  it('includes year for dates in different year', () => {
    const result = formatDate('2025-06-15')
    expect(result).toMatch(/2025/)
  })

  it('returns the raw string for invalid dates', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})

// ── calculateVolume ──────────────────────────────────────────────────

describe('calculateVolume', () => {
  it('returns 0 for empty entries', () => {
    expect(calculateVolume([])).toBe(0)
  })

  it('calculates volume for sets with both weight and reps entered', () => {
    const entries = [
      {
        sets: [
          { weight: 60, reps: 10 },
          { weight: 60, reps: 8 },
          { weight: 60, reps: 6 },
        ],
      },
    ]
    // 60*10 + 60*8 + 60*6 = 600 + 480 + 360 = 1440
    expect(calculateVolume(entries)).toBe(1440)
  })

  it('handles zero weight or reps', () => {
    const entries = [
      {
        sets: [
          { weight: 0, reps: 10 },
          { weight: 60, reps: 0 },
        ],
      },
    ]
    expect(calculateVolume(entries)).toBe(0)
  })

  it('handles multiple entries', () => {
    const entries = [
      {
        sets: [{ weight: 100, reps: 5 }],
      },
      {
        sets: [{ weight: 50, reps: 10 }],
      },
    ]
    // 100*5 + 50*10 = 500 + 500 = 1000
    expect(calculateVolume(entries)).toBe(1000)
  })

  it('excludes sets where both weight and reps are zero', () => {
    const entries = [
      {
        sets: [
          { weight: 0, reps: 0 },
        ],
      },
    ]
    expect(calculateVolume(entries)).toBe(0)
  })
})

// ── getTodayDate ─────────────────────────────────────────────────────

describe('getTodayDate', () => {
  it('returns date in YYYY-MM-DD format', () => {
    const date = getTodayDate()
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

// ── getDayOfWeek ─────────────────────────────────────────────────────

describe('getDayOfWeek', () => {
  it('returns a number between 0 and 6', () => {
    const day = getDayOfWeek()
    expect(day).toBeGreaterThanOrEqual(0)
    expect(day).toBeLessThanOrEqual(6)
  })
})
