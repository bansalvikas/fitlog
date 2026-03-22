import { useNavigate } from 'react-router-dom'
import { Clock, Dumbbell, ChevronRight } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { formatDate, formatDuration } from '../lib/utils'

export function HistoryPage() {
  const navigate = useNavigate()
  const { summaries } = useWorkoutHistory()

  return (
    <>
      <Header title="History" />
      {summaries.length > 0 ? (
        <div className="px-4 py-4 flex flex-col gap-2">
          {summaries.map((summary) => (
            <Card
              key={summary.id}
              className="cursor-pointer active:scale-[0.98] transition-transform"
              onClick={() => navigate(`/history/${summary.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-white truncate">
                      {summary.routineName || 'Workout'}
                    </p>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {formatDate(summary.date)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(summary.duration * 60)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell size={12} />
                      {summary.exerciseCount} exercises
                    </span>
                    <span>{summary.totalSets} sets</span>
                    {summary.totalVolume > 0 && (
                      <span>{summary.totalVolume.toLocaleString()} kg</span>
                    )}
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-600 shrink-0 ml-2" />
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Clock size={40} />}
          title="No workouts yet"
          description="Complete your first workout and it will show up here."
        />
      )}
    </>
  )
}
