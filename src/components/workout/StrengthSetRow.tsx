import { Check } from 'lucide-react'
import type { WorkoutSet } from '../../types'

interface StrengthSetRowProps {
  set: WorkoutSet
  entryId: string
  onUpdate: (entryId: string, setNumber: number, field: 'weight' | 'reps', value: number) => void
  onComplete: (entryId: string, setNumber: number) => void
}

export function StrengthSetRow({ set, entryId, onUpdate, onComplete }: StrengthSetRowProps) {
  return (
    <div
      className={`flex items-center gap-2 py-1 ${
        set.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Set number */}
      <span className="w-6 text-center text-xs font-medium text-slate-500">
        {set.setNumber}
      </span>

      {/* Weight input */}
      <div className="flex-1">
        <input
          type="text"
          inputMode="decimal"
          value={set.weight || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0
            onUpdate(entryId, set.setNumber, 'weight', val)
          }}
          placeholder="0"
          className="w-full h-9 px-2 text-center rounded-lg bg-slate-800 border border-slate-700 text-white text-[16px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-[9px] text-slate-600 text-center mt-0.5">kg</p>
      </div>

      {/* Reps input */}
      <div className="flex-1">
        <input
          type="text"
          inputMode="numeric"
          value={set.reps || ''}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0
            onUpdate(entryId, set.setNumber, 'reps', val)
          }}
          placeholder="0"
          className="w-full h-9 px-2 text-center rounded-lg bg-slate-800 border border-slate-700 text-white text-[16px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <p className="text-[9px] text-slate-600 text-center mt-0.5">reps</p>
      </div>

      {/* Complete button */}
      <button
        onClick={() => onComplete(entryId, set.setNumber)}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
          set.completed
            ? 'bg-green-600 text-white'
            : 'bg-slate-800 border border-slate-700 text-slate-500 active:bg-slate-700'
        }`}
      >
        <Check size={16} />
      </button>
    </div>
  )
}
