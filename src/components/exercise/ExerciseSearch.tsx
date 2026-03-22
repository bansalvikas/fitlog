import { Search, X } from 'lucide-react'

interface ExerciseSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ExerciseSearch({ value, onChange }: ExerciseSearchProps) {
  return (
    <div className="relative px-4 py-2">
      <Search size={16} className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search exercises..."
        className="w-full h-10 pl-9 pr-9 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-[16px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoFocus
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-7 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
