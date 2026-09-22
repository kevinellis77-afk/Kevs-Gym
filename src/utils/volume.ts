import { getTrackingType } from "./exerciseMeta";
import { formatExerciseSets, formatSeconds } from "./setFormat";
import type { ExerciseRecord } from "../types/session";

/**
 * The one place tonnage is calculated - History, the Progress
 * rollups, Exercise Detail and the post-workout summary all come
 * through here, so they can't drift apart.
 *
 * Tonnage is never stored on a session; it's worked out from the
 * sets each time it's shown. So changing the rules here corrects
 * every historical session automatically, with no data migration.
 *
 * Rules:
 * - Timed/duration exercises (e.g. Suitcase Hold) contribute nothing.
 *   Their second field is seconds, not reps, so weight × seconds
 *   isn't tonnage. They're reported separately as time under load.
 * - Unilateral exercises count both sides, because each side is
 *   stored as its own set: 17.5kg × 10 × 3 pairs × 2 sides.
 */
export function exerciseTonnage(exercise: ExerciseRecord): number {
  if (getTrackingType(exercise.name) === "duration") return 0;

  return (exercise.sets || []).reduce(
    (total, set) => total + Number(set.weight || 0) * Number(set.reps || 0),
    0
  );
}

export function sessionTonnage(session: any): number {
  if (!session?.exercises) return 0;

  return session.exercises.reduce(
    (total: number, exercise: ExerciseRecord) =>
      total + exerciseTonnage(exercise),
    0
  );
}

export type TimeUnderLoadRow = {
  name: string;
  // Same set summary History shows, e.g. "31kg for 30s · 3 × each side".
  sets: string;
  // Total seconds held across every set (both sides for unilateral).
  totalSeconds: number;
  totalText: string;
};

/**
 * Timed exercises in a session, reported as time under load instead
 * of tonnage. Empty for sessions with no timed exercises.
 */
export function sessionTimeUnderLoad(session: any): TimeUnderLoadRow[] {
  if (!session?.exercises) return [];

  return session.exercises
    .filter(
      (exercise: ExerciseRecord) =>
        getTrackingType(exercise.name) === "duration" &&
        (exercise.sets || []).length > 0
    )
    .map((exercise: ExerciseRecord) => {
      const totalSeconds = exercise.sets.reduce(
        (total, set) => total + Number(set.reps || 0),
        0
      );

      return {
        name: exercise.name,
        sets: formatExerciseSets(exercise.name, exercise.sets),
        totalSeconds,
        totalText: formatSeconds(totalSeconds),
      };
    });
}

/**
 * Minutes of warm-up plus cool-down attached to a lifting session.
 * 0 for standalone cardio sessions (their minutes are `duration`).
 */
export function attachedCardioMinutes(session: any): number {
  return (
    (Number(session?.warmUp?.minutes) || 0) +
    (Number(session?.coolDown?.minutes) || 0)
  );
}
