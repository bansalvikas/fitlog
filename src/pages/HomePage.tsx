import { useNavigate } from 'react-router-dom'
import { Dumbbell, Plus, Play, Calendar, Trophy } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { useWorkout } from '../contexts/WorkoutContext'
import { useRoutines } from '../hooks/useRoutines'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'

export function HomePage() {
  const navigate = useNavigate()
  const { isActive } = useWorkout()
  const { routines, todayRoutine } = useRoutines()
  const { weekWorkoutCount } = useWorkoutHistory()

  return (
    <>
      <Header title="FitLog" />
      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Resume banner */}
        {isActive && (
          <Card className="!bg-blue-950/50 !border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-300">Workout in Progress</p>
                <p className="text-xs text-blue-400/70">Tap to continue</p>
              </div>
              <Button size="sm" onClick={() => navigate('/workout')}>
                Resume
              </Button>
            </div>
          </Card>
        )}

        {/* Week summary */}
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
            <Trophy size={18} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {weekWorkoutCount} workout{weekWorkoutCount !== 1 ? 's' : ''} this week
            </p>
            <p className="text-xs text-slate-500">Keep it up!</p>
          </div>
        </Card>

        {/* Today's routine */}
        {todayRoutine && !isActive && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-blue-400" />
              <span className="text-xs font-medium text-slate-400">TODAY'S ROUTINE</span>
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              {todayRoutine.name}
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              {todayRoutine.exercises.length} exercises
            </p>
            <Button
              fullWidth
              onClick={() => navigate('/workout')}
              className="gap-2"
            >
              <Play size={16} />
              Start {todayRoutine.name}
            </Button>
          </Card>
        )}

        {/* Start empty workout */}
        {!isActive && (
          <Button
            fullWidth
            size="lg"
            variant={todayRoutine ? 'secondary' : 'primary'}
            onClick={() => navigate('/workout')}
            className="gap-2"
          >
            <Plus size={20} />
            Start Empty Workout
          </Button>
        )}

        {/* Routines */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-400">Routines</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/routines/new')}
              className="!min-h-0 !h-auto !px-2 !py-1"
            >
              <Plus size={14} className="mr-1" />
              New
            </Button>
          </div>

          {routines.length > 0 ? (
            <div className="flex flex-col gap-2">
              {routines.map((routine) => (
                <Card
                  key={routine.id}
                  className="cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => navigate(`/routines/${routine.id}/edit`)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{routine.name}</p>
                      <p className="text-xs text-slate-500">
                        {routine.exercises.length} exercises
                        {routine.daysOfWeek.length > 0 && (
                          <>
                            {' · '}
                            {routine.daysOfWeek
                              .map((d) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d])
                              .join(', ')}
                          </>
                        )}
                      </p>
                    </div>
                    <Dumbbell size={16} className="text-slate-600" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<Dumbbell size={36} />}
                title="No routines yet"
                description="Create a routine to organize your workouts."
                action={
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate('/routines/new')}
                  >
                    Create Routine
                  </Button>
                }
              />
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
