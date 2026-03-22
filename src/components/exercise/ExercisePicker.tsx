import { useState, useMemo } from 'react'
import { Modal } from '../ui/Modal'
import { ExerciseSearch } from './ExerciseSearch'
import { ExerciseGroupList } from './ExerciseGroupList'
import { ExerciseItem } from './ExerciseItem'
import { useExercises } from '../../hooks/useExercises'
import type { Exercise } from '../../types'

interface ExercisePickerProps {
  open: boolean
  onClose: () => void
  onSelect: (exercise: Exercise) => void
}

export function ExercisePicker({ open, onClose, onSelect }: ExercisePickerProps) {
  const [query, setQuery] = useState('')
  const { groupedExercises, searchExercises } = useExercises()

  const searchResults = useMemo(() => searchExercises(query), [query, searchExercises])

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise)
    onClose()
    setQuery('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Exercise" fullScreen>
      <ExerciseSearch value={query} onChange={setQuery} />

      <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {query.trim() ? (
          // Flat search results
          searchResults.length > 0 ? (
            <div>
              {searchResults.map((exercise) => (
                <ExerciseItem
                  key={exercise.id}
                  exercise={exercise}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16 text-slate-500 text-sm">
              <p>No exercises found for "{query}"</p>
            </div>
          )
        ) : (
          // Grouped list
          <ExerciseGroupList groups={groupedExercises} onSelect={handleSelect} />
        )}
      </div>
    </Modal>
  )
}
