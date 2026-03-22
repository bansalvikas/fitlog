/**
 * Reusable Auth Guard
 *
 * Shows children only when authenticated.
 * Shows a loading spinner while checking auth, and a fallback when not signed in.
 *
 * Usage:
 *   <AuthGuard fallback={<LoginPage />}>
 *     <App />
 *   </AuthGuard>
 */
import { type ReactNode } from 'react'
import { useFirebaseAuth } from './FirebaseAuthProvider'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactNode
  loadingComponent?: ReactNode
}

export function AuthGuard({ children, fallback, loadingComponent }: AuthGuardProps) {
  const { user, loading } = useFirebaseAuth()

  if (loading) {
    return (
      <>
        {loadingComponent ?? (
          <div className="flex items-center justify-center min-h-screen bg-slate-950">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Loading…</p>
            </div>
          </div>
        )}
      </>
    )
  }

  if (!user) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
