interface HeaderProps {
  title: string
  rightAction?: React.ReactNode
}

export function Header({ title, rightAction }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 pt-[env(safe-area-inset-top)]">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        <h1 className="text-lg font-semibold text-white truncate">{title}</h1>
        {rightAction && <div>{rightAction}</div>}
      </div>
    </header>
  )
}
