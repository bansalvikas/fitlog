import { createContext, useReducer, useContext, type ReactNode } from 'react'
import type { Workout, WorkoutEntry, WorkoutSet, WorkoutAction, Exercise } from '../types'
import { generateId, getTodayDate } from '../lib/utils'

interface WorkoutContextValue {
  workout: Workout | null
  isActive: boolean
  dispatch: React.Dispatch<WorkoutAction>
}

const WorkoutContext = createContext<WorkoutContextValue>({
  workout: null,
  isActive: false,
  dispatch: () => {},
})

function createDefaultSet(setNumber: number): WorkoutSet {
  return { setNumber, weight: 0, reps: 0, completed: false }
}

function createEntryFromExercise(exercise: Exercise, order: number): WorkoutEntry {
  return {
    id: generateId(),
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    bodyPart: exercise.primaryBodyPart,
    logMode: exercise.defaultLogMode,
    order,
    sets: exercise.defaultLogMode === 'sets_reps_weight'
      ? [createDefaultSet(1)]
      : [],
    duration: undefined,
    distance: undefined,
  }
}

function workoutReducer(state: Workout | null, action: WorkoutAction): Workout | null {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'START_WORKOUT': {
      return {
        id: generateId(),
        userId: action.payload.userId,
        date: getTodayDate(),
        startTime: now,
        routineId: action.payload.routineId,
        routineName: action.payload.routineName,
        status: 'in_progress',
        entries: [],
        createdAt: now,
        updatedAt: now,
      }
    }

    case 'RESUME_WORKOUT':
      return action.payload

    case 'ADD_EXERCISE': {
      if (!state) return state
      const { exercise, previousSets, previousDuration, previousDistance } = action.payload
      const newEntry = createEntryFromExercise(exercise, state.entries.length)

      // Smart Recall: pre-populate from last workout if available
      if (previousSets && previousSets.length > 0) {
        newEntry.sets = previousSets.map((s, i) => ({
          setNumber: i + 1,
          weight: s.weight,
          reps: s.reps,
          completed: false,
        }))
      }
      if (previousDuration !== undefined) newEntry.duration = previousDuration
      if (previousDistance !== undefined) newEntry.distance = previousDistance

      return {
        ...state,
        entries: [...state.entries, newEntry],
        updatedAt: now,
      }
    }

    case 'REMOVE_EXERCISE': {
      if (!state) return state
      return {
        ...state,
        entries: state.entries
          .filter((e) => e.id !== action.payload.entryId)
          .map((e, i) => ({ ...e, order: i })),
        updatedAt: now,
      }
    }

    case 'ADD_SET': {
      if (!state) return state
      return {
        ...state,
        entries: state.entries.map((entry) => {
          if (entry.id !== action.payload.entryId) return entry
          const nextSetNum = entry.sets.length + 1
          return {
            ...entry,
            sets: [...entry.sets, createDefaultSet(nextSetNum)],
          }
        }),
        updatedAt: now,
      }
    }

    case 'REMOVE_SET': {
      if (!state) return state
      return {
        ...state,
        entries: state.entries.map((entry) => {
          if (entry.id !== action.payload.entryId) return entry
          return {
            ...entry,
            sets: entry.sets
              .filter((s) => s.setNumber !== action.payload.setNumber)
              .map((s, i) => ({ ...s, setNumber: i + 1 })),
          }
        }),
        updatedAt: now,
      }
    }

    case 'UPDATE_SET': {
      if (!state) return state
      return {
        ...state,
        entries: state.entries.map((entry) => {
          if (entry.id !== action.payload.entryId) return entry
          return {
            ...entry,
            sets: entry.sets.map((s) => {
              if (s.setNumber !== action.payload.setNumber) return s
              return {
                ...s,
                ...(action.payload.weight !== undefined && { weight: action.payload.weight }),
                ...(action.payload.reps !== undefined && { reps: action.payload.reps }),
              }
            }),
          }
        }),
        updatedAt: now,
      }
    }

    case 'COMPLETE_SET': {
      if (!state) return state
      return {
        ...state,
        entries: state.entries.map((entry) => {
          if (entry.id !== action.payload.entryId) return entry
          return {
            ...entry,
            sets: entry.sets.map((s) => {
              if (s.setNumber !== action.payload.setNumber) return s
              return { ...s, completed: !s.completed }
            }),
          }
        }),
        updatedAt: now,
      }
    }

    case 'UPDATE_CARDIO': {
      if (!state) return state
      return {
        ...state,
        entries: state.entries.map((entry) => {
          if (entry.id !== action.payload.entryId) return entry
          return {
            ...entry,
            ...(action.payload.duration !== undefined && { duration: action.payload.duration }),
            ...(action.payload.distance !== undefined && { distance: action.payload.distance }),
          }
        }),
        updatedAt: now,
      }
    }

    case 'REORDER_EXERCISES': {
      if (!state) return state
      const entryMap = new Map(state.entries.map((e) => [e.id, e]))
      return {
        ...state,
        entries: action.payload.entryIds
          .map((id, i) => {
            const entry = entryMap.get(id)
            return entry ? { ...entry, order: i } : null
          })
          .filter((e): e is WorkoutEntry => e !== null),
        updatedAt: now,
      }
    }

    case 'FINISH_WORKOUT': {
      if (!state) return state
      return {
        ...state,
        status: 'completed',
        endTime: now,
        updatedAt: now,
      }
    }

    case 'DISCARD_WORKOUT':
      return null

    default:
      return state
  }
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [workout, dispatch] = useReducer(workoutReducer, null)

  return (
    <WorkoutContext.Provider
      value={{
        workout,
        isActive: workout !== null && workout.status === 'in_progress',
        dispatch,
      }}
    >
      {children}
    </WorkoutContext.Provider>
  )
}

export function useWorkout() {
  return useContext(WorkoutContext)
}
