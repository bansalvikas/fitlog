import { Plus, Trash2, TrendingUp } from 'lucide-react'
import type { WorkoutEntry } from '../../types'
import type { OverloadSuggestion } from '../../hooks/useOverloadSuggestion'
import { StrengthSetRow } from './StrengthSetRow'
import { CardioEntryForm } from './CardioEntryForm'
import { Card } from '../ui/Card'

interface ExerciseCardProps {
  entry: WorkoutEntry
  overloadSuggestion?: OverloadSuggestion | null
  onAddSet: (entryId: string) => void
  onRemoveSet: (entryId: string, setNumber: number) => void
  onRemoveExercise: (entryId: string) => void
  onUpdateSet: (entryId: string, setNumber: number, field: 'weight' | 'reps', value: number) => void
  onUpdateCardio: (entryId: string, field: 'duration' | 'distance', value: number) => void
}

export function ExerciseCard({
  entry,
  overloadSuggestion,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  onUpdateSet,
  onUpdateCardio,
}: ExerciseCardProps) {
  const isStrength = entry.logMode === 'sets_reps_weight'

  return (
    <Card className="overflow-hidden">
      {/* Progressive overload suggestion */}
      {overloadSuggestion && (
        <div className="flex items-start gap-2 mb-3 px-2.5 py-2 rounded-lg bg-emerald-950/50 border border-emerald-800/30">
          <TrendingUp size={14} className="text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-emerald-300 leading-relaxed">
            {overloadSuggestion.message}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{entry.exerciseName}</h3>
          <p className="text-[10px] text-slate-500 capitalize">
            {entry.bodyPart.replace('_', ' ')}
          </p>
        </div>
        <button
          onClick={() => {
            const hasData = entry.sets.some((s) => s.weight > 0 || s.reps > 0)
              || (entry.duration != null && entry.duration > 0)
              || (entry.distance != null && entry.distance > 0)
            if (hasData && !confirm(`Remove ${entry.exerciseName}? Logged data will be lost.`)) return
            onRemoveExercise(entry.id)
          }}
          className="p-2 -mr-2 text-slate-600 hover:text-red-400 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Body */}
      {isStrength ? (
        <>
          {/* Column headers */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 shrink-0" />
            <span className="flex-1 text-center text-[9px] font-medium text-slate-600">KG</span>
            <span className="flex-1 text-center text-[9px] font-medium text-slate-600">REPS</span>
          </div>

          {/* Set rows */}
          <div className="flex flex-col gap-1">
            {entry.sets.map((set) => (
              <StrengthSetRow
                key={set.setNumber}
                set={set}
                entryId={entry.id}
                onUpdate={onUpdateSet}
                onRemoveSet={onRemoveSet}
              />
            ))}
          </div>

          {/* Add set button */}
          <button
            onClick={() => onAddSet(entry.id)}
            className="flex items-center justify-center gap-1 w-full mt-2 py-2 text-xs text-blue-400 hover:text-blue-300 active:scale-[0.98] transition-colors"
          >
            <Plus size={14} />
            Add Set
          </button>
        </>
      ) : (
        <CardioEntryForm
          entryId={entry.id}
          duration={entry.duration}
          distance={entry.distance}
          onUpdate={onUpdateCardio}
        />
      )}
    </Card>
  )
}
