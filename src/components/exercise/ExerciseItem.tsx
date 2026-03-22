import type { Exercise } from '../../types'

interface ExerciseItemProps {
  exercise: Exercise
  onSelect: (exercise: Exercise) => void
}

const equipmentLabel: Record<string, string> = {
  barbell: 'Barbell',
  dumbbell: 'Dumbbell',
  cable: 'Cable',
  machine: 'Machine',
  bodyweight: 'Bodyweight',
  kettlebell: 'Kettlebell',
  ab_wheel: 'Ab Wheel',
  battle_ropes: 'Battle Ropes',
  sled: 'Sled',
  treadmill: 'Treadmill',
  bike: 'Bike',
  elliptical: 'Elliptical',
  rower: 'Rower',
  jump_rope: 'Jump Rope',
  mat: 'Mat',
  foam_roller: 'Foam Roller',
  pool: 'Pool',
  none: '',
}

export function ExerciseItem({ exercise, onSelect }: ExerciseItemProps) {
  return (
    <button
      onClick={() => onSelect(exercise)}
      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-slate-800/50 transition-colors min-h-[52px]"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{exercise.name}</p>
        <p className="text-xs text-slate-500 truncate">
          {equipmentLabel[exercise.equipment] || exercise.equipment}
          {exercise.isCustom && ' · Custom'}
        </p>
      </div>
      <span className="text-[10px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full shrink-0">
        {exercise.primaryBodyPart.replace('_', ' ')}
      </span>
    </button>
  )
}
