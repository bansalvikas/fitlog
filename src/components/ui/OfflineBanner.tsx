import { WifiOff } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus'

export function OfflineBanner() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white text-xs font-medium text-center py-1.5 flex items-center justify-center gap-1.5">
      <WifiOff size={12} />
      Offline — changes will sync when reconnected
    </div>
  )
}
