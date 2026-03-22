import { useMemo, useState, useCallback } from 'react'
import catalogData from '../data/exercises.json'
import type { CatalogExercise, Exercise, BodyPart } from '../types'
import { BODY_PART_GROUPS as GROUPS } from '../types'

const catalogExercises: Exercise[] = (catalogData.exercises as CatalogExercise[]).map((e) => ({
  ...e,
  isCustom: false,
  isArchived: false,
}))

export function useExercises() {
  // Custom exercises would come from Firestore subscription.
  // For now, just use catalog exercises.
  const [customExercises] = useState<Exercise[]>([])

  const allExercises = useMemo(
    () => [...catalogExercises, ...customExercises].filter((e) => !e.isArchived),
    [customExercises]
  )

  const groupedExercises = useMemo(() => {
    const groups: Record<string, Exercise[]> = {}

    for (const [groupName, bodyParts] of Object.entries(GROUPS)) {
      const exercises = allExercises.filter((e) =>
        (bodyParts as BodyPart[]).includes(e.primaryBodyPart)
      )
      if (exercises.length > 0) {
        groups[groupName] = exercises.sort((a, b) => {
          // Common exercises first, then alphabetical
          if (a.isCommon !== b.isCommon) return a.isCommon ? -1 : 1
          return a.name.localeCompare(b.name)
        })
      }
    }

    return groups
  }, [allExercises])

  const searchExercises = useCallback(
    (query: string): Exercise[] => {
      if (!query.trim()) return []
      const q = query.toLowerCase()
      return allExercises
        .filter(
          (e) =>
            e.name.toLowerCase().includes(q) ||
            e.aliases.some((a) => a.toLowerCase().includes(q)) ||
            e.primaryBodyPart.toLowerCase().includes(q) ||
            e.equipment.toLowerCase().includes(q)
        )
        .sort((a, b) => {
          // Exact name match first, then starts-with, then includes
          const aExact = a.name.toLowerCase() === q
          const bExact = b.name.toLowerCase() === q
          if (aExact !== bExact) return aExact ? -1 : 1
          const aStarts = a.name.toLowerCase().startsWith(q)
          const bStarts = b.name.toLowerCase().startsWith(q)
          if (aStarts !== bStarts) return aStarts ? -1 : 1
          return a.name.localeCompare(b.name)
        })
    },
    [allExercises]
  )

  const getExerciseById = useCallback(
    (id: string): Exercise | undefined => {
      return allExercises.find((e) => e.id === id)
    },
    [allExercises]
  )

  return {
    allExercises,
    groupedExercises,
    searchExercises,
    getExerciseById,
  }
}
