import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Workout, WorkoutEntry, Routine } from '../types'

/** Strip undefined values from an object (Firestore rejects undefined) */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as T
}

// ── Workouts ────────────────────────────────────────────────────────

/** Save a completed workout to Firestore (atomic batch write) */
export async function saveWorkoutToFirestore(userId: string, workout: Workout): Promise<void> {
  const batch = writeBatch(db)

  const workoutRef = doc(db, 'users', userId, 'workouts', workout.id)
  const { entries, ...workoutData } = workout
  batch.set(workoutRef, stripUndefined(workoutData))

  // Save entries as subcollection in the same batch
  for (const entry of entries) {
    const entryRef = doc(db, 'users', userId, 'workouts', workout.id, 'entries', entry.id)
    batch.set(entryRef, stripUndefined(entry as unknown as Record<string, unknown>))
  }

  await batch.commit()
}

/** Load all workouts for a user (most recent first) */
export async function loadWorkoutsFromFirestore(userId: string): Promise<Workout[]> {
  const workoutsRef = collection(db, 'users', userId, 'workouts')
  const q = query(workoutsRef, orderBy('date', 'desc'), limit(100))
  const snapshot = await getDocs(q)

  const workouts: Workout[] = []
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data()
    // Load entries subcollection
    const entriesRef = collection(db, 'users', userId, 'workouts', docSnap.id, 'entries')
    const entriesSnap = await getDocs(query(entriesRef, orderBy('order')))
    const entries: WorkoutEntry[] = entriesSnap.docs.map((e) => e.data() as WorkoutEntry)

    workouts.push({
      ...data,
      id: docSnap.id,
      entries,
    } as Workout)
  }

  return workouts
}

/** Subscribe to workouts (real-time updates) */
export function subscribeToWorkouts(
  userId: string,
  callback: (workouts: Workout[]) => void
): Unsubscribe {
  const workoutsRef = collection(db, 'users', userId, 'workouts')
  const q = query(workoutsRef, orderBy('date', 'desc'), limit(100))

  return onSnapshot(
    q,
    async (snapshot) => {
      const workouts: Workout[] = []
      // Load entries for each workout (parallelized for performance)
      const promises = snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data()
        const entriesRef = collection(db, 'users', userId, 'workouts', docSnap.id, 'entries')
        const entriesSnap = await getDocs(query(entriesRef, orderBy('order')))
        const entries: WorkoutEntry[] = entriesSnap.docs.map((e) => e.data() as WorkoutEntry)

        return {
          ...data,
          id: docSnap.id,
          entries,
        } as Workout
      })

      const results = await Promise.all(promises)
      workouts.push(...results)
      callback(workouts)
    },
    (error) => {
      console.error('[Firestore] Workout subscription error:', error)
    }
  )
}

/** Delete a workout (atomic batch delete) */
export async function deleteWorkoutFromFirestore(userId: string, workoutId: string): Promise<void> {
  const batch = writeBatch(db)

  // Delete entries first
  const entriesRef = collection(db, 'users', userId, 'workouts', workoutId, 'entries')
  const entriesSnap = await getDocs(entriesRef)
  for (const entryDoc of entriesSnap.docs) {
    batch.delete(entryDoc.ref)
  }
  batch.delete(doc(db, 'users', userId, 'workouts', workoutId))

  await batch.commit()
}

// ── Routines ────────────────────────────────────────────────────────

/** Save a routine to Firestore */
export async function saveRoutineToFirestore(userId: string, routine: Routine): Promise<void> {
  const routineRef = doc(db, 'users', userId, 'routines', routine.id)
  await setDoc(routineRef, routine)
}

/** Load all routines for a user */
export async function loadRoutinesFromFirestore(userId: string): Promise<Routine[]> {
  const routinesRef = collection(db, 'users', userId, 'routines')
  const q = query(routinesRef, orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Routine)
}

/** Subscribe to routines (real-time) */
export function subscribeToRoutines(
  userId: string,
  callback: (routines: Routine[]) => void
): Unsubscribe {
  const routinesRef = collection(db, 'users', userId, 'routines')
  const q = query(routinesRef, orderBy('createdAt', 'desc'))

  return onSnapshot(
    q,
    (snapshot) => {
      const routines = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Routine)
      callback(routines)
    },
    (error) => {
      console.error('[Firestore] Routine subscription error:', error)
    }
  )
}

/** Delete a routine */
export async function deleteRoutineFromFirestore(userId: string, routineId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'routines', routineId))
}
