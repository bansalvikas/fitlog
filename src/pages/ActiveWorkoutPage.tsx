import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation, useBlocker } from 'react-router-dom'
import { ArrowLeft, Plus, Loader2 } from 'lucide-react'
import { useWorkout } from '../contexts/WorkoutContext'
import { ExercisePicker } from '../components/exercise/ExercisePicker'
import { ExerciseCard } from '../components/workout/ExerciseCard'
import { WorkoutTimer } from '../components/workout/WorkoutTimer'
import { WorkoutSummaryModal } from '../components/workout/WorkoutSummaryModal'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { showToast } from '../components/ui/Toast'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { useOverloadSuggestions } from '../hooks/useOverloadSuggestion'
import { useRoutines } from '../hooks/useRoutines'
import { useExercises } from '../hooks/useExercises'
import { useAuth } from '../hooks/useAuth'
import type { Exercise, Workout } from '../types'
import { Dumbbell } from 'lucide-react'

export function ActiveWorkoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { workouts, saveWorkout, getLastExerciseData } = useWorkoutHistory()
  const { getRoutineById } = useRoutines()
  const { getExerciseById } = useExercises()
  const { workout, dispatch } = useWorkout()
  const overloadSuggestions = useOverloadSuggestions(workout?.entries ?? [], workouts)
  const [showPicker, setShowPicker] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [finishedWorkout, setFinishedWorkout] = useState<Workout | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Read routineId from location state (passed from HomePage)
  const routineId = (location.state as { routineId?: string } | null)?.routineId

  // Auto-start workout if none active
  useEffect(() => {
    if (!workout && user) {
      // Look up routine if passed via location state
      const routine = routineId ? getRoutineById(routineId) : null
      dispatch({
        type: 'START_WORKOUT',
        payload: {
          userId: user.uid,
          routineId: routine?.id,
          routineName: routine?.name,
        },
      })

      // Auto-add routine exercises with Smart Recall
      if (routine) {
        for (const re of routine.exercises) {
          const exercise = getExerciseById(re.exerciseId)
          if (exercise) {
            const lastData = getLastExerciseData(exercise.id)
            dispatch({
              type: 'ADD_EXERCISE',
              payload: {
                exercise,
                previousSets: lastData?.sets,
                previousDuration: lastData?.duration,
                previousDistance: lastData?.distance,
              },
            })
          }
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Bug 3: Block browser back / in-app navigation when workout has data
  const hasUnsavedWork = workout !== null && workout.status === 'in_progress' && workout.entries.length > 0

  // Block in-app router navigation
  const blocker = useBlocker(hasUnsavedWork && !showSummary)

  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (confirm('Discard this workout? All logged data will be lost.')) {
        dispatch({ type: 'DISCARD_WORKOUT' })
        blocker.proceed()
      } else {
        blocker.reset()
      }
    }
  }, [blocker, dispatch])

  // Block browser back / tab close
  useEffect(() => {
    if (!hasUnsavedWork) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault() }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [hasUnsavedWork])

  const handleAddExercise = useCallback(
    (exercise: Exercise) => {
      // Smart Recall: look up last workout data for this exercise
      const lastData = getLastExerciseData(exercise.id)
      dispatch({
        type: 'ADD_EXERCISE',
        payload: {
          exercise,
          previousSets: lastData?.sets,
          previousDuration: lastData?.duration,
          previousDistance: lastData?.distance,
        },
      })
    },
    [dispatch, getLastExerciseData]
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

  const handleRemoveSet = useCallback(
    (entryId: string, setNumber: number) => {
      dispatch({ type: 'REMOVE_SET', payload: { entryId, setNumber } })
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

  // Bug 1: Make handleFinish async and await saveWorkout
  const handleFinish = async () => {
    if (!workout || workout.entries.length === 0) return
    if (isSaving) return

    setIsSaving(true)
    const now = new Date().toISOString()
    const completed: Workout = {
      ...workout,
      status: 'completed',
      endTime: now,
      updatedAt: now,
    }

    try {
      await saveWorkout(completed)
      dispatch({ type: 'FINISH_WORKOUT' })
      setFinishedWorkout(completed)
      setShowSummary(true)
    } catch (err) {
      console.error('Failed to save workout:', err)
      showToast('Failed to save workout. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscard = () => {
    if (hasUnsavedWork) {
      if (!confirm('Discard this workout? All logged data will be lost.')) return
    }
    dispatch({ type: 'DISCARD_WORKOUT' })
    navigate('/')
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

          {/* Bug 5: Show toast when tapping finish with no exercises */}
          <div onClick={() => { if (!hasEntries) showToast('Add an exercise first', 'error') }}>
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinish}
              disabled={!hasEntries || isSaving}
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Finish'}
            </Button>
          </div>
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
                overloadSuggestion={overloadSuggestions.get(entry.exerciseId)}
                onAddSet={handleAddSet}
                onRemoveSet={handleRemoveSet}
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
