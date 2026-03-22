import type { Workout, Routine } from '../types'

interface ExportData {
  version: 1
  exportedAt: string
  workouts: Workout[]
  routines: Routine[]
}

/** Export all workout data as a JSON file download */
export function exportAsJson(workouts: Workout[], routines: Routine[]) {
  const data: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    workouts,
    routines,
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `fitlog-export-${formatFileDate()}.json`)
}

/** Export workout history as a CSV file download */
export function exportAsCsv(workouts: Workout[]) {
  const rows: string[][] = [
    ['Date', 'Workout Name', 'Exercise', 'Body Part', 'Set #', 'Weight (kg)', 'Reps', 'Completed', 'Duration (min)', 'Distance (km)'],
  ]

  for (const w of workouts) {
    if (w.status !== 'completed') continue
    for (const entry of w.entries) {
      if (entry.sets.length > 0) {
        for (const set of entry.sets) {
          rows.push([
            w.date,
            w.routineName ?? '',
            entry.exerciseName,
            entry.bodyPart,
            String(set.setNumber),
            String(set.weight),
            String(set.reps),
            set.completed ? 'Yes' : 'No',
            '',
            '',
          ])
        }
      } else {
        // Cardio / duration-only entries
        rows.push([
          w.date,
          w.routineName ?? '',
          entry.exerciseName,
          entry.bodyPart,
          '',
          '',
          '',
          '',
          entry.duration != null ? String(entry.duration) : '',
          entry.distance != null ? String(entry.distance) : '',
        ])
      }
    }
  }

  const csv = rows.map((row) => row.map(escCsv).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `fitlog-export-${formatFileDate()}.csv`)
}

function escCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatFileDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
