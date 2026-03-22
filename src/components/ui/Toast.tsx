import { useEffect, useState } from 'react'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

interface ToastData {
  id: string
  message: string
  type: ToastType
}

// Simple global toast state
let toastListeners: ((toasts: ToastData[]) => void)[] = []
let toasts: ToastData[] = []

function notify() {
  toastListeners.forEach((l) => l([...toasts]))
}

export function showToast(message: string, type: ToastType = 'success') {
  const id = Math.random().toString(36).slice(2)
  toasts = [...toasts, { id, message, type }]
  notify()

  setTimeout(() => {
    dismissToast(id)
  }, 3000)
}

function dismissToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id)
  notify()
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: AlertCircle,
}

const colorMap = {
  success: 'bg-green-900/90 border-green-700 text-green-200',
  error: 'bg-red-900/90 border-red-700 text-red-200',
  info: 'bg-blue-900/90 border-blue-700 text-blue-200',
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastData[]>([])

  useEffect(() => {
    toastListeners.push(setItems)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setItems)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] flex flex-col gap-2 max-w-lg mx-auto pointer-events-none">
      {items.map((toast) => {
        const Icon = iconMap[toast.type]
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border backdrop-blur-md pointer-events-auto animate-in slide-in-from-top ${colorMap[toast.type]}`}
          >
            <Icon size={18} className="shrink-0" />
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 hover:opacity-70"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
