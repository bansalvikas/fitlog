# FitLog Test Plan

> **75 tests** across 5 test files | Run with `pnpm test` | Watch mode: `pnpm test:watch`

---

## Quick Reference

```bash
pnpm test              # Run all tests once
pnpm test:watch        # Run in watch mode (re-runs on file changes)
pnpm test -- --reporter=verbose   # Show each test name
```

---

## Test Files & Coverage Map

| Test File | Source File(s) | Tests | Category |
|-----------|---------------|-------|----------|
| `src/lib/utils.test.ts` | `src/lib/utils.ts` | 18 | Utility functions |
| `src/contexts/WorkoutContext.test.ts` | `src/contexts/WorkoutContext.tsx` | 28 | Workout state machine |
| `src/hooks/useOverloadSuggestion.test.ts` | `src/hooks/useOverloadSuggestion.ts` | 8 | Progressive overload |
| `src/lib/exportData.test.ts` | `src/lib/exportData.ts` | 7 | Data export |
| `src/lib/firestore.test.ts` | `src/lib/firestore.ts`, `firestore.rules` | 14 | Database & security |

---

## 1. Utility Functions (`src/lib/utils.test.ts`)

### generateId
| # | Test Case | Priority |
|---|-----------|----------|
| 1 | Returns a non-empty string | P0 |
| 2 | Returns unique IDs on 100 successive calls | P0 |

### formatDuration
| # | Test Case | Input | Expected | Priority |
|---|-----------|-------|----------|----------|
| 3 | Formats 0 seconds | `0` | `"00:00"` | P1 |
| 4 | Formats seconds-only | `45` | `"00:45"` | P1 |
| 5 | Formats minutes and seconds | `125` | `"02:05"` | P1 |
| 6 | Formats with hours | `3661` | `"1:01:01"` | P1 |
| 7 | Clamps negative numbers to 00:00 | `-10` | `"00:00"` | P0 |
| 8 | Handles 24 hours | `86400` | `"24:00:00"` | P2 |
| 9 | Floors non-integer seconds | `90.5` | `"01:30"` | P0 |

### formatDate
| # | Test Case | Input | Expected | Priority |
|---|-----------|-------|----------|----------|
| 10 | Returns "Today" for today | today's date | `"Today"` | P1 |
| 11 | Returns "Yesterday" | yesterday | `"Yesterday"` | P1 |
| 12 | Returns "X days ago" for < 7 days | 4 days ago | `"4 days ago"` | P1 |
| 13 | Formatted date for same year | Jan 15 (same year) | `"Jan 15"` | P1 |
| 14 | Includes year for different year | Jun 15, 2025 | contains `"2025"` | P1 |
| 15 | Returns raw string for invalid dates | `"not-a-date"` | `"not-a-date"` | P0 |

### calculateVolume
| # | Test Case | Expected | Priority |
|---|-----------|----------|----------|
| 16 | Empty entries | `0` | P1 |
| 17 | Counts only completed sets (60kg x 10 + 60kg x 8, skips incomplete) | `1080` | P0 |
| 18 | Zero weight or reps produces 0 | `0` | P1 |
| 19 | Multiple entries summed (100x5 + 50x10) | `1000` | P1 |
| 20 | All incomplete sets | `0` | P1 |

### getTodayDate / getDayOfWeek
| # | Test Case | Priority |
|---|-----------|----------|
| 21 | Returns YYYY-MM-DD format | P1 |
| 22 | Returns number 0-6 | P1 |

---

## 2. Workout Reducer (`src/contexts/WorkoutContext.test.ts`)

### START_WORKOUT
| # | Test Case | Priority |
|---|-----------|----------|
| 23 | Creates workout with correct userId, status, empty entries | P0 |
| 24 | Includes routineId and routineName when provided | P1 |

### ADD_EXERCISE
| # | Test Case | Priority |
|---|-----------|----------|
| 25 | Strength exercise gets 3 default sets (weight: 0, reps: 0) | P0 |
| 26 | Cardio exercise gets 0 sets, logMode = duration_distance | P0 |
| 27 | Smart Recall: pre-populates sets from previousSets (weight/reps correct, completed=false) | P0 |
| 28 | Smart Recall: pre-populates duration/distance for cardio | P0 |
| 29 | Returns null when state is null (no crash) | P0 |
| 30 | Multiple exercises get correct order (0, 1, 2...) | P1 |

### REMOVE_EXERCISE
| # | Test Case | Priority |
|---|-----------|----------|
| 31 | Removes correct exercise by entryId | P0 |
| 32 | Re-indexes order after removal (no gaps) | P0 |
| 33 | Does nothing for non-existent entryId | P1 |

### ADD_SET / REMOVE_SET
| # | Test Case | Priority |
|---|-----------|----------|
| 34 | ADD_SET: appends set with correct setNumber | P0 |
| 35 | REMOVE_SET: removes correct set, re-indexes remaining | P0 |

### UPDATE_SET
| # | Test Case | Priority |
|---|-----------|----------|
| 36 | Updates weight only (reps unchanged) | P0 |
| 37 | Updates reps only (weight unchanged) | P0 |
| 38 | Updates both weight and reps | P0 |

### COMPLETE_SET
| # | Test Case | Priority |
|---|-----------|----------|
| 39 | Toggles completed: false → true | P0 |
| 40 | Toggles completed: true → false | P0 |

### UPDATE_CARDIO
| # | Test Case | Priority |
|---|-----------|----------|
| 41 | Updates duration | P0 |
| 42 | Updates distance | P0 |

### REORDER_EXERCISES
| # | Test Case | Priority |
|---|-----------|----------|
| 43 | Reverses order of 2 exercises correctly | P1 |
| 44 | Filters out invalid/non-existent IDs | P1 |

### FINISH_WORKOUT / DISCARD_WORKOUT
| # | Test Case | Priority |
|---|-----------|----------|
| 45 | FINISH: sets status=completed, adds endTime | P0 |
| 46 | FINISH: returns null when state is null | P1 |
| 47 | DISCARD: returns null | P0 |

### Null State Safety
| # | Test Case | Priority |
|---|-----------|----------|
| 48 | All 9 entry-modifying actions return null when state is null | P0 |

---

## 3. Progressive Overload (`src/hooks/useOverloadSuggestion.test.ts`)

| # | Test Case | Expected | Priority |
|---|-----------|----------|----------|
| 49 | Only 1 session → no suggestion | `null` | P1 |
| 50 | Unknown exercise → no suggestion | `null` | P1 |
| 51 | 2+ sessions at 60kg x 10 x 3 sets → suggest 62.5kg | `increase_weight` | P0 |
| 52 | 2+ sessions at 80kg x 5 x 3 sets → suggest 6 reps | `increase_reps` | P0 |
| 53 | 2+ sessions at 80kg x 5 x 2 sets → suggest add set | `add_set` | P0 |
| 54 | Non-completed workout is skipped | `null` | P1 |
| 55 | Non-completed sets are skipped | `null` | P1 |
| 56 | 0kg bodyweight → suggests 2.5kg (not negative) | `increase_weight` | P0 |

---

## 4. Data Export (`src/lib/exportData.test.ts`)

### exportAsJson
| # | Test Case | Priority |
|---|-----------|----------|
| 57 | Valid data does not throw | P0 |
| 58 | Empty data does not throw | P1 |
| 59 | Creates blob via URL.createObjectURL | P1 |

### exportAsCsv
| # | Test Case | Priority |
|---|-----------|----------|
| 60 | Valid data does not throw | P0 |
| 61 | Empty workouts does not throw | P1 |
| 62 | Skips non-completed workouts | P0 |
| 63 | Handles commas in exercise names (CSV escaping) | P0 |
| 64 | Handles cardio entries (no sets, has duration/distance) | P0 |

---

## 5. Firestore & Security (`src/lib/firestore.test.ts`)

### Data Model Integrity
| # | Test Case | Priority |
|---|-----------|----------|
| 65 | Workout type has all required Firestore fields | P0 |
| 66 | WorkoutEntry has exerciseId for Smart Recall | P0 |
| 67 | Routine has daysOfWeek for schedule matching | P1 |

### Security Rules Analysis
| # | Test Case | Priority |
|---|-----------|----------|
| 68 | Rules enforce `request.auth != null` and `uid == userId` on all paths | P0 |
| 69 | No wildcard allow-all patterns exist | P0 |
| 70 | No data exposed outside `/users/{userId}` namespace | P0 |

### CRUD Structure Verification
| # | Test Case | Priority |
|---|-----------|----------|
| 71 | saveWorkoutToFirestore uses `writeBatch` for atomic saves | P0 |
| 72 | deleteWorkoutFromFirestore uses batch deletes for atomicity | P0 |
| 73 | subscribeToWorkouts loads entries subcollection | P0 |
| 74 | Both subscriptions have error handlers | P0 |
| 75 | subscribeToWorkouts uses `Promise.all` for parallel loading | P1 |

---

## Areas Not Yet Covered (Future Work)

| Area | Why | Recommended Approach |
|------|-----|---------------------|
| React component rendering | Requires React Testing Library with full context setup | Add component tests for HomePage, ActiveWorkoutPage, SettingsPage |
| Firebase Auth flow | Requires Firebase Auth emulator | Use `@firebase/rules-unit-testing` with emulator |
| Firestore live read/write | Requires Firestore emulator | Set up `firebase emulators:start` in CI |
| E2E user flows | Requires browser automation | Add Playwright tests for login → workout → save → history |
| Offline mode | Requires network simulation | Test with Playwright `context.setOffline(true)` |
| PWA install/update | Requires service worker testing | Manual testing or Workbox test utilities |

---

## Running Tests Before Major Changes

Before any major refactor or feature addition, run:

```bash
# 1. Full test suite
pnpm test

# 2. Type check
npx tsc --noEmit

# 3. Lint
pnpm lint

# 4. Production build
pnpm build
```

All four should pass cleanly before pushing changes.
