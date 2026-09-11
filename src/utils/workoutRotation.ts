import { getSessions } from "./sessionStorage";
import { workouts } from "../data/workouts";
import type { WorkoutTemplate } from "../data/workouts";

/**
 * Returns the next workout in the rotation.
 *
 * Looks at the most recent saved session that has a workoutId
 * (older sessions saved before rotation was added won't have one,
 * and are skipped) and returns the following workout in the
 * `workouts` array, wrapping back to the start. If no session has
 * a workoutId yet, starts at the first workout.
 */
export function getNextWorkout(): WorkoutTemplate {
  if (workouts.length === 0) {
    throw new Error("No workouts defined in data/workouts.ts");
  }

  const sessions = getSessions();

  const lastWorkoutSession = sessions.find(
    (session) => session.workoutId
  );

  if (!lastWorkoutSession) {
    return workouts[0];
  }

  const lastIndex = workouts.findIndex(
    (workout) => workout.id === lastWorkoutSession.workoutId
  );

  if (lastIndex === -1) {
    // Session references a workout that no longer exists in the registry.
    return workouts[0];
  }

  const nextIndex = (lastIndex + 1) % workouts.length;

  return workouts[nextIndex];
}