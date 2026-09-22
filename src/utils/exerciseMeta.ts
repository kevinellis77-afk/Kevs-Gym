import { workouts, type WorkoutExercise } from "../data/workouts";

/**
 * Finds an exercise definition by display name, scanning the
 * workout registry so it always reflects whatever's currently
 * defined in data/workouts.ts. Sessions store exercises by name,
 * which is why lookups go by name rather than id.
 */
function findExerciseByName(
  exerciseName: string
): WorkoutExercise | null {
  for (const workout of workouts) {
    const match = workout.exercises.find(
      (exercise) => exercise.name === exerciseName
    );

    if (match) return match;
  }

  return null;
}

/**
 * How a given exercise's second set-field should be interpreted -
 * "reps" (default) or "duration" (timed holds).
 */
export function getTrackingType(
  exerciseName: string
): "reps" | "duration" {
  return findExerciseByName(exerciseName)?.trackingType ?? "reps";
}

/**
 * Whether an exercise is defined as done one side at a time. For
 * displaying an already-saved record, prefer checking the sets
 * themselves for side tags (see utils/setFormat.ts) - that's what
 * was actually logged, whatever the definition says today.
 */
export function isUnilateral(exerciseName: string): boolean {
  return findExerciseByName(exerciseName)?.unilateral ?? false;
}
