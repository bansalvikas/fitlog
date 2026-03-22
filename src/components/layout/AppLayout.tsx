import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* pt-14 accounts for fixed header, pb-20 accounts for bottom nav */}
      <main className="pt-14 pb-20 max-w-lg mx-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
