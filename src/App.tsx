import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WorkoutProvider } from './contexts/WorkoutContext'
import { AuthGuard } from './components/auth/AuthGuard'
import { AppLayout } from './components/layout/AppLayout'
import { ToastContainer } from './components/ui/Toast'
import { HomePage } from './pages/HomePage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'
import { OfflineBanner } from './components/ui/OfflineBanner'

// Lazy-loaded pages (heavy dependencies like Recharts, ExercisePicker)
const ProgressPage = lazy(() =>
  import('./pages/ProgressPage').then((m) => ({ default: m.ProgressPage }))
)
const ActiveWorkoutPage = lazy(() =>
  import('./pages/ActiveWorkoutPage').then((m) => ({ default: m.ActiveWorkoutPage }))
)
const RoutineEditorPage = lazy(() =>
  import('./pages/RoutineEditorPage').then((m) => ({ default: m.RoutineEditorPage }))
)
const WorkoutDetailPage = lazy(() =>
  import('./pages/WorkoutDetailPage').then((m) => ({ default: m.WorkoutDetailPage }))
)

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950">
      <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <WorkoutProvider>
          <BrowserRouter>
            <OfflineBanner />
            <ToastContainer />
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                {/* Full-screen routes (no bottom nav) */}
                <Route path="/workout" element={<ActiveWorkoutPage />} />
                <Route path="/routines/new" element={<RoutineEditorPage />} />
                <Route path="/routines/:id/edit" element={<RoutineEditorPage />} />
                <Route path="/history/:workoutId" element={<WorkoutDetailPage />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </WorkoutProvider>
      </AuthGuard>
    </AuthProvider>
  )
}

export default App
