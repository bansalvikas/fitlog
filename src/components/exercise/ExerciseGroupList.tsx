import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { Exercise } from '../../types'
import { ExerciseItem } from './ExerciseItem'

interface ExerciseGroupListProps {
  groups: Record<string, Exercise[]>
  onSelect: (exercise: Exercise) => void
}

export function ExerciseGroupList({ groups, onSelect }: ExerciseGroupListProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (group: string) => {
    setExpanded((prev) => ({ ...prev, [group]: !prev[group] }))
  }

  return (
    <div className="divide-y divide-slate-800/50">
      {Object.entries(groups).map(([groupName, exercises]) => {
        const isOpen = expanded[groupName] ?? false
        return (
          <div key={groupName}>
            <button
              onClick={() => toggle(groupName)}
              className="w-full flex items-center justify-between px-4 py-3 text-left active:bg-slate-800/30 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-300">
                {groupName}
                <span className="ml-2 text-xs text-slate-500 font-normal">
                  {exercises.length}
                </span>
              </span>
              {isOpen ? (
                <ChevronDown size={16} className="text-slate-500" />
              ) : (
                <ChevronRight size={16} className="text-slate-500" />
              )}
            </button>
            {isOpen && (
              <div className="bg-slate-900/50">
                {exercises.map((exercise) => (
                  <ExerciseItem
                    key={exercise.id}
                    exercise={exercise}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
