import { useState, useEffect } from 'react'
import { formatDuration } from '../../lib/utils'

interface WorkoutTimerProps {
  startTime: string
}

export function WorkoutTimer({ startTime }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(startTime).getTime()

    const tick = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startTime])

  return (
    <span className="font-mono text-sm text-slate-400">
      {formatDuration(elapsed)}
    </span>
  )
}
