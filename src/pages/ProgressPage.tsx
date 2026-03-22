import { useState, useMemo } from 'react'
import { TrendingUp, ChevronDown } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { StrengthProgressChart, CardioProgressChart } from '../components/progress/ProgressChart'
import { useProgressData } from '../hooks/useProgressData'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { useExercises } from '../hooks/useExercises'

export function ProgressPage() {
  const { workouts } = useWorkoutHistory()
  const { getExerciseById } = useExercises()
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)

  // Get unique exercise IDs from workout history
  const exercisesInHistory = useMemo(() => {
    const seen = new Map<string, string>()
    for (const workout of workouts) {
      if (workout.status !== 'completed') continue
      for (const entry of workout.entries) {
        if (!seen.has(entry.exerciseId)) {
          seen.set(entry.exerciseId, entry.exerciseName)
        }
      }
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }))
  }, [workouts])

  const { strengthData, cardioData } = useProgressData(selectedExerciseId)
  const selectedExercise = selectedExerciseId ? getExerciseById(selectedExerciseId) : null
  const isCardio = selectedExercise && selectedExercise.defaultLogMode !== 'sets_reps_weight'

  if (exercisesInHistory.length === 0) {
    return (
      <>
        <Header title="Progress" />
        <EmptyState
          icon={<TrendingUp size={40} />}
          title="No data yet"
          description="Log some workouts to see your progress over time."
        />
      </>
    )
  }

  return (
    <>
      <Header title="Progress" />
      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Exercise selector */}
        <div className="relative">
          <select
            value={selectedExerciseId ?? ''}
            onChange={(e) => setSelectedExerciseId(e.target.value || null)}
            className="w-full h-11 px-3 pr-10 rounded-xl bg-slate-800 border border-slate-700 text-white text-[16px] appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select an exercise</option>
            {exercisesInHistory.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
        </div>

        {/* Chart */}
        {selectedExerciseId && (
          <Card>
            <h3 className="text-sm font-semibold text-white mb-3">
              {selectedExercise?.name ?? 'Exercise'} — Progress
            </h3>
            {isCardio ? (
              cardioData.length > 0 ? (
                <CardioProgressChart data={cardioData} />
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">
                  No cardio data for this exercise yet.
                </p>
              )
            ) : strengthData.length > 0 ? (
              <StrengthProgressChart data={strengthData} />
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                No strength data for this exercise yet.
              </p>
            )}
          </Card>
        )}

        {/* Summary stats */}
        {selectedExerciseId && strengthData.length > 0 && !isCardio && (
          <Card>
            <h3 className="text-sm font-semibold text-slate-400 mb-3">Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {Math.max(...strengthData.map((d) => d.bestWeight))}
                </p>
                <p className="text-[10px] text-slate-500">Max Weight (kg)</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {Math.max(...strengthData.map((d) => d.bestReps))}
                </p>
                <p className="text-[10px] text-slate-500">Max Reps</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  {strengthData.length}
                </p>
                <p className="text-[10px] text-slate-500">Sessions</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
