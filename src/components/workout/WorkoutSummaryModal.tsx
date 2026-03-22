import { Trophy, Clock, Dumbbell, Weight } from 'lucide-react'
import type { Workout } from '../../types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { formatDuration, calculateVolume } from '../../lib/utils'

interface WorkoutSummaryModalProps {
  workout: Workout
  open: boolean
  onClose: () => void
}

export function WorkoutSummaryModal({ workout, open, onClose }: WorkoutSummaryModalProps) {
  const durationSeconds = workout.endTime
    ? Math.floor((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 1000)
    : 0

  const totalSets = workout.entries.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0
  )

  const totalVolume = calculateVolume(workout.entries)

  const stats = [
    {
      icon: Clock,
      label: 'Duration',
      value: formatDuration(durationSeconds),
    },
    {
      icon: Dumbbell,
      label: 'Exercises',
      value: workout.entries.length.toString(),
    },
    {
      icon: Trophy,
      label: 'Sets',
      value: totalSets.toString(),
    },
    {
      icon: Weight,
      label: 'Volume',
      value: `${totalVolume.toLocaleString()} kg`,
    },
  ]

  return (
    <Modal open={open} onClose={onClose} title="Workout Complete">
      <div className="p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">💪</div>
          <h3 className="text-xl font-bold text-white">Great Work!</h3>
          {workout.routineName && (
            <p className="text-sm text-slate-400 mt-1">{workout.routineName}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="bg-slate-800 rounded-xl p-3 text-center"
            >
              <Icon size={18} className="mx-auto text-blue-400 mb-1" />
              <p className="text-lg font-bold text-white">{value}</p>
              <p className="text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <Button fullWidth onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  )
}
