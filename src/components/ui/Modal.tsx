import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  fullScreen?: boolean
}

export function Modal({ open, onClose, title, children, fullScreen = false }: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Content */}
      <div
        className={`
          relative z-10 bg-slate-900 w-full overflow-y-auto
          ${fullScreen
            ? 'h-full'
            : 'max-h-[90vh] rounded-t-2xl sm:rounded-2xl sm:max-w-lg sm:mx-4'
          }
        `}
      >
        {/* Header */}
        {(title || !fullScreen) && (
          <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-slate-800">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 -mr-2 text-slate-400 hover:text-white active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={20} />
            </button>
          </div>
        )}

        {children}
      </div>
    </div>
  )
}
