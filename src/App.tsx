import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { WorkoutProvider } from './contexts/WorkoutContext'
import { AuthGuard } from './components/auth/AuthGuard'
import { AppLayout } from './components/layout/AppLayout'
import { ToastContainer } from './components/ui/Toast'
import { HomePage } from './pages/HomePage'
import { HistoryPage } from './pages/HistoryPage'
import { WorkoutDetailPage } from './pages/WorkoutDetailPage'
import { ProgressPage } from './pages/ProgressPage'
import { SettingsPage } from './pages/SettingsPage'
import { ActiveWorkoutPage } from './pages/ActiveWorkoutPage'
import { RoutineEditorPage } from './pages/RoutineEditorPage'

function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <WorkoutProvider>
          <BrowserRouter>
            <ToastContainer />
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
          </BrowserRouter>
        </WorkoutProvider>
      </AuthGuard>
    </AuthProvider>
  )
}

export default App
