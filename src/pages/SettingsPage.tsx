import { useNavigate } from 'react-router-dom'
import { ChevronRight, LogOut, FileJson, FileSpreadsheet } from 'lucide-react'
import { Header } from '../components/layout/Header'
import { Card } from '../components/ui/Card'
import { useAuth } from '../hooks/useAuth'
import { useWorkoutHistory } from '../hooks/useWorkoutHistory'
import { useRoutines } from '../hooks/useRoutines'
import { exportAsJson, exportAsCsv } from '../lib/exportData'

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { workouts } = useWorkoutHistory()
  const { routines } = useRoutines()

  return (
    <>
      <Header title="Settings" />
      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Account */}
        <Card>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Account</h3>
          <div className="flex items-center gap-3">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt=""
                className="w-10 h-10 rounded-full"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                {user?.displayName?.charAt(0) ?? '?'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user?.displayName}</p>
              <p className="text-sm text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-red-400 text-sm hover:bg-slate-800 active:scale-[0.97] transition-all w-full"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </Card>

        {/* Routines link — UX 2: Go to home (where routines list lives) */}
        <Card
          className="cursor-pointer active:scale-[0.98] transition-transform"
          onClick={() => navigate('/')}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-white">Manage Routines</h3>
              <p className="text-xs text-slate-500">View and manage your workout templates</p>
            </div>
            <ChevronRight size={16} className="text-slate-600" />
          </div>
        </Card>

        {/* Data Export */}
        <Card>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Export Data</h3>
          <p className="text-xs text-slate-500 mb-3">
            Download your workout history and routines.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => exportAsJson(workouts, routines)}
              disabled={workouts.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <FileJson size={16} />
              JSON
            </button>
            <button
              onClick={() => exportAsCsv(workouts)}
              disabled={workouts.length === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-medium hover:bg-slate-700 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              <FileSpreadsheet size={16} />
              CSV
            </button>
          </div>
        </Card>

        {/* App Info */}
        <Card>
          <h3 className="text-sm font-medium text-slate-400 mb-2">About</h3>
          <p className="text-sm text-slate-300">FitLog v0.1.0</p>
          <p className="text-xs text-slate-500 mt-1">Personal workout tracker</p>
        </Card>
      </div>
    </>
  )
}
