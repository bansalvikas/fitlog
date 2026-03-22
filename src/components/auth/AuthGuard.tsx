import type { ReactNode } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) {
    // For now (mock auth), this shouldn't happen.
    // When real auth is added, redirect to /login here.
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <p>Please sign in to continue.</p>
      </div>
    )
  }

  return <>{children}</>
}
