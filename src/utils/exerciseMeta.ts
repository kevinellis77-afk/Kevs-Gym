import { workouts } from "../data/workouts";

/**
 * Looks up how a given exercise's second set-field should be
 * interpreted — "reps" (default) or "duration" (timed holds).
 * Scans the workout registry so it always reflects whatever's
 * currently defined in data/workouts.ts.
 */
export function getTrackingType(
  exerciseName: string
): "reps" | "duration" {
  for (const workout of workouts) {
    const match = workout.exercises.find(
      (exercise) => exercise.name === exerciseName
    );

    if (match) {
      return match.trackingType ?? "reps";
    }
  }

  return "reps";
}