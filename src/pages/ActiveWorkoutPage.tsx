import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { useWorkout } from '../contexts/WorkoutContext'
import { ExercisePicker } from '../components/exercise/ExercisePicker'
import { ExerciseCard } from '../components/workout/ExerciseCard'
import { WorkoutTimer } from '../components/workout/WorkoutTimer'
import { WorkoutSummaryModal } from '../components/workout/WorkoutSummaryModal'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { useAuth } from '../hooks/useAuth'
import type { Exercise, Workout } from '../types'
import { Dumbbell } from 'lucide-react'

export function ActiveWorkoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { saveWorkout } = useWorkoutHistory()
  const { workout, dispatch } = useWorkout()
  const [showPicker, setShowPicker] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [finishedWorkout, setFinishedWorkout] = useState<Workout | null>(null)

  // Auto-start workout if none active
  useEffect(() => {
    if (!workout && user) {
      dispatch({ type: 'START_WORKOUT', payload: { userId: user.uid } })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAddExercise = useCallback(
    (exercise: Exercise) => {
      dispatch({ type: 'ADD_EXERCISE', payload: { exercise } })
    },
    [dispatch]
  )

  const handleRemoveExercise = useCallback(
    (entryId: string) => {
      dispatch({ type: 'REMOVE_EXERCISE', payload: { entryId } })
    },
    [dispatch]
  )

  const handleAddSet = useCallback(
    (entryId: string) => {
      dispatch({ type: 'ADD_SET', payload: { entryId } })
    },
    [dispatch]
  )

  const handleUpdateSet = useCallback(
    (entryId: string, setNumber: number, field: 'weight' | 'reps', value: number) => {
      dispatch({
        type: 'UPDATE_SET',
        payload: {
          entryId,
          setNumber,
          ...(field === 'weight' ? { weight: value } : { reps: value }),
        },
      })
    },
    [dispatch]
  )

  const handleCompleteSet = useCallback(
    (entryId: string, setNumber: number) => {
      dispatch({ type: 'COMPLETE_SET', payload: { entryId, setNumber } })
    },
    [dispatch]
  )

  const handleUpdateCardio = useCallback(
    (entryId: string, field: 'duration' | 'distance', value: number) => {
      dispatch({
        type: 'UPDATE_CARDIO',
        payload: {
          entryId,
          ...(field === 'duration' ? { duration: value } : { distance: value }),
        },
      })
    },
    [dispatch]
  )

  const handleFinish = () => {
    if (!workout || workout.entries.length === 0) return
    const now = new Date().toISOString()
    // Save a copy before finishing
    const completed: Workout = {
      ...workout,
      status: 'completed',
      endTime: now,
      updatedAt: now,
    }
    saveWorkout(completed)
    dispatch({ type: 'FINISH_WORKOUT' })
    setFinishedWorkout(completed)
    setShowSummary(true)
  }

  const handleDiscard = () => {
    if (confirm('Discard this workout? All logged data will be lost.')) {
      dispatch({ type: 'DISCARD_WORKOUT' })
      navigate('/')
    }
  }

  const handleSummaryClose = () => {
    setShowSummary(false)
    dispatch({ type: 'DISCARD_WORKOUT' }) // Clear the finished workout from context
    navigate('/')
  }

  if (!workout) return null

  const hasEntries = workout.entries.length > 0
  const completedSets = workout.entries.reduce(
    (sum, e) => sum + e.sets.filter((s) => s.completed).length,
    0
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <button
            onClick={handleDiscard}
            className="flex items-center gap-1 text-slate-400 hover:text-white active:scale-95 min-w-[44px] min-h-[44px]"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-white">
              {workout.routineName || 'Workout'}
            </p>
            <WorkoutTimer startTime={workout.startTime} />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleFinish}
            disabled={!hasEntries}
          >
            Finish
          </Button>
        </div>
      </header>

      {/* Body */}
      <div className="px-4 py-4 pb-24 max-w-lg mx-auto flex flex-col gap-3">
        {hasEntries ? (
          <>
            {/* Stats bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>{workout.entries.length} exercise{workout.entries.length !== 1 ? 's' : ''}</span>
              <span>{completedSets} set{completedSets !== 1 ? 's' : ''} completed</span>
            </div>

            {/* Exercise cards */}
            {workout.entries.map((entry) => (
              <ExerciseCard
                key={entry.id}
                entry={entry}
                onAddSet={handleAddSet}
                onRemoveExercise={handleRemoveExercise}
                onUpdateSet={handleUpdateSet}
                onCompleteSet={handleCompleteSet}
                onUpdateCardio={handleUpdateCardio}
              />
            ))}
          </>
        ) : (
          <EmptyState
            icon={<Dumbbell size={40} />}
            title="Add an exercise to start"
            description="Tap the button below to pick an exercise."
          />
        )}
      </div>

      {/* Floating add button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 max-w-lg mx-auto">
        <Button
          fullWidth
          size="lg"
          variant="secondary"
          onClick={() => setShowPicker(true)}
          className="gap-2 shadow-lg shadow-black/30"
        >
          <Plus size={20} />
          Add Exercise
        </Button>
      </div>

      {/* Exercise picker modal */}
      <ExercisePicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={handleAddExercise}
      />

      {/* Post-workout summary */}
      {finishedWorkout && (
        <WorkoutSummaryModal
          workout={finishedWorkout}
          open={showSummary}
          onClose={handleSummaryClose}
        />
      )}
    </div>
  )
}
