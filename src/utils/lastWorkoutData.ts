import { getSessions } from "./sessionStorage";
import type { ExerciseRecord } from "../types/session";

/**
 * The most recent logged record of a given exercise - from whichever
 * session last included it, not just the latest session overall.
 *
 * With workouts rotating A -> B -> C, the latest session is usually
 * a different workout, so only checking sessions[0] meant "Last"
 * showed "--" most of the time and the logger's weight/reps
 * steppers fell back to the target instead of last time's numbers.
 *
 * Sessions are stored newest first, so the first match is the most
 * recent. Cardio-only sessions have no exercises and are skipped,
 * as is any record with no sets logged.
 */
export function getLastExerciseData(
  exerciseName: string
): ExerciseRecord | null {
  for (const session of getSessions()) {
    const match = session.exercises?.find(
      (exercise) =>
        exercise.name === exerciseName &&
        (exercise.sets || []).length > 0
    );

    if (match) return match;
  }

  return null;
}