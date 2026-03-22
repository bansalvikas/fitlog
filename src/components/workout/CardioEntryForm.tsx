interface CardioEntryFormProps {
  entryId: string
  duration?: number
  distance?: number
  onUpdate: (entryId: string, field: 'duration' | 'distance', value: number) => void
}

export function CardioEntryForm({ entryId, duration, distance, onUpdate }: CardioEntryFormProps) {
  return (
    <div className="flex gap-3 py-1">
      {/* Duration */}
      <div className="flex-1">
        <label className="text-[10px] font-medium text-slate-500 block mb-1">
          Duration (min)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={duration || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0
            onUpdate(entryId, 'duration', val)
          }}
          placeholder="0"
          className="w-full h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-[16px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      {/* Distance */}
      <div className="flex-1">
        <label className="text-[10px] font-medium text-slate-500 block mb-1">
          Distance (km)
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={distance || ''}
          onChange={(e) => {
            const val = parseFloat(e.target.value) || 0
            onUpdate(entryId, 'distance', val)
          }}
          placeholder="—"
          className="w-full h-9 px-3 rounded-lg bg-slate-800 border border-slate-700 text-white text-[16px] focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}
