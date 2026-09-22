import { getSessions, saveAllSessions } from "./sessionStorage";
import { isUnilateral } from "./exerciseMeta";
import type {
  CardioBlock,
  ExerciseRecord,
  WorkoutSession,
} from "../types/session";

// Records which migrations have completed, so startup doesn't redo
// them every time the app opens.
const MIGRATIONS_DONE_KEY = "kev-migrations";
const MIGRATION_ID = "2026-09-cardio-attach-unilateral-pairs";

// An untouched copy of the sessions exactly as they were before this
// migration first ran - a safety net, never read by the app itself.
// Only ever written once, so a later re-run can't overwrite it with
// already-migrated data.
const SNAPSHOT_KEY = "kev-workouts-premigration-2026-09";

function isLiftSession(session: WorkoutSession): boolean {
  return session.type !== "cardio" && Array.isArray(session.exercises);
}

function localDayKey(dateValue: string): string | null {
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function timeOf(dateValue: string): number | null {
  const time = new Date(dateValue).getTime();
  return isNaN(time) ? null : time;
}

/**
 * Unilateral exercises logged before pairing existed were saved as
 * 6 separate sets. Tag them as left/right pairs by position: sets
 * 1+2 = pair 1, 3+4 = pair 2, 5+6 = pair 3 (first of each = left).
 *
 * Skipped (left exactly as is) when:
 * - any set already has a side tag - already migrated, or logged
 *   with the new pairing flow; this is what makes re-running safe
 * - the set count is odd - pairing by position would be a guess.
 */
function pairUnilateralSets(exercise: ExerciseRecord): ExerciseRecord {
  const sets = exercise.sets || [];

  if (!isUnilateral(exercise.name)) return exercise;
  if (sets.length === 0 || sets.length % 2 !== 0) return exercise;
  if (sets.some((set) => set.side)) return exercise;

  return {
    ...exercise,
    sets: sets.map((set, index) => ({
      ...set,
      side: index % 2 === 0 ? "left" : "right",
    })),
  };
}

function toCardioBlock(session: WorkoutSession): CardioBlock {
  return {
    cardioType: session.cardioType || "Cycling",
    minutes: Number(session.duration) || 0,
    effort: Number(session.cardioRpe) || 0,
    ...(session.notes && { notes: session.notes }),
    migratedFromId: session.id,
  };
}

/**
 * Pure migration over a sessions list (newest first in, newest first
 * out). Safe to run any number of times on the same data.
 *
 * 1. Unilateral sets -> left/right pairs (see pairUnilateralSets).
 *
 * 2. Standalone Cycling sessions are attached to a lifting workout
 *    on the same calendar day as its warm-up or cool-down:
 *    - A lifting session's `date` is when Finish was tapped, and a
 *      cardio session's `date` is when it was saved. Cycling saved
 *      before the workout's timestamp became the warm-up; saved after,
 *      the cool-down. If the times can't be compared (missing or
 *      identical), it defaults to warm-up.
 *    - With several workouts that day, the one nearest in time wins.
 *    - If that slot is already taken by a different entry, the
 *      cycling session stays standalone rather than being lost or
 *      overwriting anything.
 *    - No workout that day: stays standalone.
 *    - Walking, Rowing and Intervals sessions are never attached.
 *    - A cycling entry whose id is already attached to some workout
 *      (e.g. brought back by restoring an older backup) is dropped
 *      as a duplicate instead of being attached twice.
 */
export function migrateSessions(input: WorkoutSession[]): WorkoutSession[] {
  let sessions: WorkoutSession[] = input.map((session) =>
    isLiftSession(session)
      ? {
          ...session,
          exercises: (session.exercises || []).map(pairUnilateralSets),
        }
      : session
  );

  const alreadyAttached = new Set<string>();

  sessions.forEach((session) => {
    if (session.warmUp?.migratedFromId) {
      alreadyAttached.add(session.warmUp.migratedFromId);
    }
    if (session.coolDown?.migratedFromId) {
      alreadyAttached.add(session.coolDown.migratedFromId);
    }
  });

  const removeIds = new Set<string>();

  // Oldest first, so if two cycling entries compete for one slot the
  // earlier one gets it.
  const cyclingSessions = sessions
    .filter(
      (session) =>
        session.type === "cardio" && session.cardioType === "Cycling"
    )
    .reverse();

  cyclingSessions.forEach((cardio) => {
    if (alreadyAttached.has(cardio.id)) {
      removeIds.add(cardio.id);
      return;
    }

    const day = localDayKey(cardio.date);
    if (!day) return;

    const cardioTime = timeOf(cardio.date);

    const sameDayWorkouts = sessions.filter(
      (session) => isLiftSession(session) && localDayKey(session.date) === day
    );

    if (sameDayWorkouts.length === 0) return;

    const workout =
      cardioTime === null
        ? sameDayWorkouts[0]
        : sameDayWorkouts.reduce((nearest, candidate) => {
            const nearestGap = Math.abs((timeOf(nearest.date) ?? 0) - cardioTime);
            const candidateGap = Math.abs((timeOf(candidate.date) ?? 0) - cardioTime);
            return candidateGap < nearestGap ? candidate : nearest;
          });

    const workoutTime = timeOf(workout.date);

    const slot: "warmUp" | "coolDown" =
      cardioTime !== null && workoutTime !== null && cardioTime > workoutTime
        ? "coolDown"
        : "warmUp";

    if (workout[slot]) return;

    sessions = sessions.map((session) =>
      session.id === workout.id
        ? { ...session, [slot]: toCardioBlock(cardio) }
        : session
    );

    alreadyAttached.add(cardio.id);
    removeIds.add(cardio.id);
  });

  return sessions.filter((session) => !removeIds.has(session.id));
}

/**
 * Runs migrateSessions() over whatever's in storage right now and
 * saves the result. No once-only check - used after a backup restore,
 * where freshly merged-in sessions may need migrating.
 */
export function migrateStoredSessions() {
  saveAllSessions(migrateSessions(getSessions()));
}

/**
 * Called once from main.tsx before the app renders. Does nothing if
 * this migration has already completed on this device. If anything
 * throws, the stored data is left untouched and the migration isn't
 * marked done, so it simply tries again next launch.
 */
export function runStartupMigrations() {
  try {
    const done: string[] = JSON.parse(
      localStorage.getItem(MIGRATIONS_DONE_KEY) || "[]"
    );

    if (done.includes(MIGRATION_ID)) return;

    const raw = localStorage.getItem("kev-workouts");

    if (raw && !localStorage.getItem(SNAPSHOT_KEY)) {
      localStorage.setItem(SNAPSHOT_KEY, raw);
    }

    migrateStoredSessions();

    localStorage.setItem(
      MIGRATIONS_DONE_KEY,
      JSON.stringify([...done, MIGRATION_ID])
    );
  } catch (error) {
    console.error("Kev's Gym: data migration failed", error);
  }
}
