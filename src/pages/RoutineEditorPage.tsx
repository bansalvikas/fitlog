import { useState, useCallback, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, GripVertical } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'
import { ExercisePicker } from '../components/exercise/ExercisePicker'
import { useRoutines } from '../hooks/useRoutines'
import { showToast } from '../components/ui/Toast'
import { LOG_MODE_LABELS } from '../lib/utils'
import type { Exercise, RoutineExercise, DayOfWeek } from '../types'

const DAYS = [
  { value: 0, label: 'S' },
  { value: 1, label: 'M' },
  { value: 2, label: 'T' },
  { value: 3, label: 'W' },
  { value: 4, label: 'T' },
  { value: 5, label: 'F' },
  { value: 6, label: 'S' },
] as const

export function RoutineEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getRoutineById, createRoutine, updateRoutine, loading } = useRoutines()

  const existing = id ? getRoutineById(id) : null

  const [name, setName] = useState(existing?.name ?? '')
  const [daysOfWeek, setDaysOfWeek] = useState<DayOfWeek[]>(existing?.daysOfWeek ?? [])
  const [exercises, setExercises] = useState<RoutineExercise[]>(existing?.exercises ?? [])
  const [showPicker, setShowPicker] = useState(false)

  // Bug 2: Sync form state when existing routine loads from Firestore
  useEffect(() => {
    if (existing) {
      setName(existing.name)
      setDaysOfWeek(existing.daysOfWeek)
      setExercises(existing.exercises)
    }
  }, [existing])

  const toggleDay = (day: DayOfWeek) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  const handleAddExercise = useCallback((exercise: Exercise) => {
    const newExercise: RoutineExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      logMode: exercise.defaultLogMode,
      defaultSets: 3,
      order: exercises.length,
    }
    setExercises((prev) => [...prev, newExercise])
  }, [exercises.length])

  const handleRemoveExercise = (index: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== index).map((e, i) => ({ ...e, order: i })))
  }

  const handleSave = () => {
    if (!name.trim()) {
      showToast('Please enter a routine name', 'error')
      return
    }
    if (exercises.length === 0) {
      showToast('Add at least one exercise', 'error')
      return
    }

    if (existing) {
      updateRoutine(existing.id, { name: name.trim(), daysOfWeek, exercises })
      showToast('Routine updated')
    } else {
      createRoutine(name.trim(), daysOfWeek, exercises)
      showToast('Routine created')
    }
    navigate('/')
  }

  // Show loading spinner while waiting for routine data to load
  if (id && !existing && loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-400 hover:text-white active:scale-95 min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-semibold">
            {existing ? 'Edit Routine' : 'New Routine'}
          </h1>
          <Button variant="primary" size="sm" onClick={handleSave}>
            Save
          </Button>
        </div>
      </header>

      <div className="px-4 py-4 max-w-lg mx-auto flex flex-col gap-4">
        {/* Name */}
        <Input
          label="Routine Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Push Day, Leg Day"
        />

        {/* Days of week */}
        <div>
          <label className="text-sm font-medium text-slate-400 block mb-2">
            Schedule (optional)
          </label>
          <div className="flex gap-2">
            {DAYS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => toggleDay(value as DayOfWeek)}
                className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                  daysOfWeek.includes(value as DayOfWeek)
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Exercises */}
        <div>
          <label className="text-sm font-medium text-slate-400 block mb-2">
            Exercises
          </label>

          {exercises.length > 0 ? (
            <div className="flex flex-col gap-2">
              {exercises.map((exercise, index) => (
                <Card key={`${exercise.exerciseId}-${index}`} className="flex items-center gap-3 !p-3">
                  <GripVertical size={16} className="text-slate-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {exercise.exerciseName}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {exercise.defaultSets} sets · {LOG_MODE_LABELS[exercise.logMode] ?? exercise.logMode}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveExercise(index)}
                    className="p-2 text-slate-600 hover:text-red-400 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    <Trash2 size={16} />
                  </button>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="!py-8 text-center text-sm text-slate-500">
              No exercises added yet
            </Card>
          )}

          <Button
            variant="secondary"
            fullWidth
            className="mt-3 gap-2"
            onClick={() => setShowPicker(true)}
          >
            <Plus size={18} />
            Add Exercise
          </Button>
        </div>
      </div>

      <ExercisePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddExercise}
      />
    </div>
  )
}
