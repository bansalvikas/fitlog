import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: boolean
}

export function Card({ padding = true, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-slate-900 rounded-2xl border border-slate-800 ${padding ? 'p-4' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
