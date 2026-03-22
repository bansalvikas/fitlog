/** Generate a simple unique ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/** Format seconds as HH:MM:SS or MM:SS */
export function formatDuration(totalSeconds: number): string {
  const clamped = Math.max(0, Math.floor(totalSeconds))
  const hours = Math.floor(clamped / 3600)
  const minutes = Math.floor((clamped % 3600) / 60)
  const seconds = clamped % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

/** Format ISO date string to readable date */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate)
  if (isNaN(date.getTime())) return isoDate // fallback for invalid dates

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  })
}

/** Calculate total volume (kg × reps) for a workout */
export function calculateVolume(
  entries: Array<{ sets: Array<{ weight: number; reps: number; completed: boolean }> }>
): number {
  return entries.reduce((total, entry) => {
    return (
      total +
      entry.sets
        .filter((s) => s.completed)
        .reduce((sum, s) => sum + s.weight * s.reps, 0)
    )
  }, 0)
}

/** Get today's date as YYYY-MM-DD */
export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0]
}

/** Get day of week (0=Sun, 6=Sat) */
export function getDayOfWeek(): number {
  return new Date().getDay()
}

/** Human-readable labels for exercise log modes */
export const LOG_MODE_LABELS: Record<string, string> = {
  sets_reps_weight: 'Weight & Reps',
  duration_only: 'Duration',
  duration_distance: 'Duration & Distance',
  distance_duration_load: 'Distance, Duration & Load',
}
