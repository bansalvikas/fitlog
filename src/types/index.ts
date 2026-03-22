// ── Exercise Types ──────────────────────────────────────────────────

export type ExerciseType = 'strength' | 'cardio' | 'core' | 'conditioning' | 'mobility';

export type BodyPart =
  | 'legs' | 'hamstrings' | 'quadriceps' | 'calves' | 'glutes'
  | 'chest' | 'back' | 'lats' | 'upper_back'
  | 'shoulders' | 'biceps' | 'triceps' | 'forearms' | 'traps'
  | 'core' | 'obliques'
  | 'full_body' | 'cardio';

export type Equipment =
  | 'barbell' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight'
  | 'kettlebell' | 'ab_wheel' | 'battle_ropes' | 'sled'
  | 'treadmill' | 'bike' | 'elliptical' | 'rower' | 'jump_rope'
  | 'mat' | 'foam_roller' | 'pool' | 'none';

export type LogMode = 'sets_reps_weight' | 'duration_only' | 'duration_distance' | 'distance_duration_load';

export type MovementPattern =
  | 'horizontal_push' | 'horizontal_pull' | 'vertical_push' | 'vertical_pull'
  | 'hip_hinge' | 'squat' | 'lunge' | 'carry' | 'rotation'
  | 'isolation' | 'compound' | 'cardio' | 'mobility' | 'core_stability';

/** Shape of each exercise in the bundled catalog JSON */
export interface CatalogExercise {
  id: string;
  name: string;
  type: ExerciseType;
  primaryBodyPart: BodyPart;
  secondaryBodyParts: BodyPart[];
  equipment: Equipment;
  movementPattern: MovementPattern;
  defaultLogMode: LogMode;
  aliases: string[];
  isCommon: boolean;
}

/** Merged view used throughout the app (catalog + custom) */
export interface Exercise extends CatalogExercise {
  isCustom: boolean;
  isArchived: boolean;
}

// ── Body Part Display Groups ────────────────────────────────────────

export const BODY_PART_GROUPS: Record<string, BodyPart[]> = {
  'Chest':     ['chest'],
  'Back':      ['back', 'lats', 'upper_back'],
  'Shoulders': ['shoulders', 'traps'],
  'Arms':      ['biceps', 'triceps', 'forearms'],
  'Legs':      ['legs', 'quadriceps', 'hamstrings', 'glutes', 'calves'],
  'Core':      ['core', 'obliques'],
  'Cardio':    ['cardio'],
  'Full Body': ['full_body'],
};

// ── Workout Types ───────────────────────────────────────────────────

export interface WorkoutSet {
  setNumber: number;
  weight: number;       // in kg
  reps: number;
  completed: boolean;
}

export interface WorkoutEntry {
  id: string;
  exerciseId: string;
  exerciseName: string;
  bodyPart: BodyPart;
  logMode: LogMode;
  order: number;
  sets: WorkoutSet[];
  // Cardio fields
  duration?: number;    // in minutes
  distance?: number;    // in km
}

export type WorkoutStatus = 'in_progress' | 'completed' | 'discarded';

export interface Workout {
  id: string;
  userId: string;
  date: string;         // ISO date string (YYYY-MM-DD)
  startTime: string;    // ISO datetime
  endTime?: string;     // ISO datetime
  routineId?: string;
  routineName?: string;
  status: WorkoutStatus;
  notes?: string;
  entries: WorkoutEntry[];
  createdAt: string;
  updatedAt: string;
}

/** Lightweight version for history list rendering */
export interface WorkoutSummary {
  id: string;
  date: string;
  routineName?: string;
  duration: number;     // minutes
  exerciseCount: number;
  totalSets: number;
  totalVolume: number;  // kg × reps across all sets
}

// ── Routine Types ───────────────────────────────────────────────────

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sun=0 … Sat=6

export interface RoutineExercise {
  exerciseId: string;
  exerciseName: string;
  logMode: LogMode;
  defaultSets: number;
  order: number;
}

export interface Routine {
  id: string;
  userId: string;
  name: string;
  daysOfWeek: DayOfWeek[];
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

// ── Active Workout Reducer ──────────────────────────────────────────

export type WorkoutAction =
  | { type: 'START_WORKOUT'; payload: { routineId?: string; routineName?: string } }
  | { type: 'RESUME_WORKOUT'; payload: Workout }
  | { type: 'ADD_EXERCISE'; payload: { exercise: Exercise } }
  | { type: 'REMOVE_EXERCISE'; payload: { entryId: string } }
  | { type: 'ADD_SET'; payload: { entryId: string } }
  | { type: 'REMOVE_SET'; payload: { entryId: string; setNumber: number } }
  | { type: 'UPDATE_SET'; payload: { entryId: string; setNumber: number; weight?: number; reps?: number } }
  | { type: 'COMPLETE_SET'; payload: { entryId: string; setNumber: number } }
  | { type: 'UPDATE_CARDIO'; payload: { entryId: string; duration?: number; distance?: number } }
  | { type: 'REORDER_EXERCISES'; payload: { entryIds: string[] } }
  | { type: 'FINISH_WORKOUT' }
  | { type: 'DISCARD_WORKOUT' };

// ── Progress Chart Types ────────────────────────────────────────────

export interface ProgressDataPoint {
  date: string;
  bestWeight: number;
  bestReps: number;
  totalVolume: number;   // sum(weight × reps) for all sets that day
}

export interface CardioProgressDataPoint {
  date: string;
  duration: number;
  distance?: number;
  pace?: number;         // min/km
}

// ── Auth Types ──────────────────────────────────────────────────────

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

// ── Theme ───────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';
