import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Dumbbell, Trophy, Weight } from 'lucide-react'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { Card } from '../components/ui/Card'
import { formatDuration, calculateVolume } from '../lib/utils'

export function WorkoutDetailPage() {
  const { workoutId } = useParams()
  const navigate = useNavigate()
  const { getWorkoutById } = useWorkoutHistory()

  const workout = workoutId ? getWorkoutById(workoutId) : null

  if (!workout) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-500">Workout not found</p>
      </div>
    )
  }

  const durationSeconds = workout.endTime
    ? Math.floor((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 1000)
    : 0
  const totalSets = workout.entries.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0
  )
  const totalVolume = calculateVolume(workout.entries)

  const dateStr = new Date(workout.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center h-14 px-4 max-w-lg mx-auto gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-white active:scale-95 min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold">
              {workout.routineName || 'Workout'}
            </h1>
            <p className="text-[10px] text-slate-500">{dateStr}</p>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Clock, label: 'Duration', value: formatDuration(durationSeconds) },
            { icon: Dumbbell, label: 'Exercises', value: String(workout.entries.length) },
            { icon: Trophy, label: 'Sets', value: String(totalSets) },
            { icon: Weight, label: 'Volume', value: `${totalVolume}kg` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-slate-900 rounded-xl p-2 text-center border border-slate-800">
              <Icon size={14} className="mx-auto text-blue-400 mb-1" />
              <p className="text-sm font-bold text-white">{value}</p>
              <p className="text-[9px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Exercise details */}
        {workout.entries.map((entry) => (
          <Card key={entry.id}>
            <h3 className="text-sm font-semibold text-white mb-1">{entry.exerciseName}</h3>
            <p className="text-[10px] text-slate-500 capitalize mb-2">
              {entry.bodyPart.replace('_', ' ')}
            </p>

            {entry.logMode === 'sets_reps_weight' ? (
              <div className="space-y-1">
                {entry.sets.filter((s) => s.completed).map((set) => (
                  <div key={set.setNumber} className="flex items-center gap-4 text-xs">
                    <span className="text-slate-500 w-12">Set {set.setNumber}</span>
                    <span className="text-white">{set.weight} kg × {set.reps} reps</span>
                  </div>
                ))}
                {entry.sets.filter((s) => s.completed).length === 0 && (
                  <p className="text-xs text-slate-600">No sets completed</p>
                )}
              </div>
            ) : (
              <div className="text-xs text-white">
                {entry.duration && <span>{entry.duration} min</span>}
                {entry.distance && <span> · {entry.distance} km</span>}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
