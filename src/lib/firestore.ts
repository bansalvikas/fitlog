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
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Workout, WorkoutEntry, Routine } from '../types'

// ── Workouts ────────────────────────────────────────────────────────

/** Save a completed workout to Firestore */
export async function saveWorkoutToFirestore(userId: string, workout: Workout): Promise<void> {
  const workoutRef = doc(db, 'users', userId, 'workouts', workout.id)
  const { entries, ...workoutData } = workout
  await setDoc(workoutRef, workoutData)

  // Save entries as subcollection
  for (const entry of entries) {
    const entryRef = doc(db, 'users', userId, 'workouts', workout.id, 'entries', entry.id)
    await setDoc(entryRef, entry)
  }
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

  return onSnapshot(q, async (snapshot) => {
    const workouts: Workout[] = []
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data()
      const entriesRef = collection(db, 'users', userId, 'workouts', docSnap.id, 'entries')
      const entriesSnap = await getDocs(query(entriesRef, orderBy('order')))
      const entries: WorkoutEntry[] = entriesSnap.docs.map((e) => e.data() as WorkoutEntry)

      workouts.push({
        ...data,
        id: docSnap.id,
        entries,
      } as Workout)
    }
    callback(workouts)
  })
}

/** Delete a workout */
export async function deleteWorkoutFromFirestore(userId: string, workoutId: string): Promise<void> {
  // Delete entries first
  const entriesRef = collection(db, 'users', userId, 'workouts', workoutId, 'entries')
  const entriesSnap = await getDocs(entriesRef)
  for (const entryDoc of entriesSnap.docs) {
    await deleteDoc(entryDoc.ref)
  }
  await deleteDoc(doc(db, 'users', userId, 'workouts', workoutId))
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

  return onSnapshot(q, (snapshot) => {
    const routines = snapshot.docs.map((d) => ({ ...d.data(), id: d.id }) as Routine)
    callback(routines)
  })
}

/** Delete a routine */
export async function deleteRoutineFromFirestore(userId: string, routineId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', userId, 'routines', routineId))
}
