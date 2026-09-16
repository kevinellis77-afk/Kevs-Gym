import { workouts, type WorkoutExercise } from "../data/workouts";
import { exerciseSubstitutions } from "../data/substitutions";

function findExerciseById(id: string): WorkoutExercise | null {
  for (const workout of workouts) {
    const match = workout.exercises.find(
      (exercise) => exercise.id === id
    );

    if (match) return match;
  }

  return null;
}

/**
 * Full exercise objects (not just ids) for the reasonable substitutes
 * of a given exercise - resolved from wherever in workoutA/B/C.ts
 * they're actually defined, since a substitute doesn't have to
 * belong to the same workout. Returns [] when there's nothing
 * genuinely comparable (see data/substitutions.ts).
 */
export function getSubstitutesFor(
  exerciseId: string
): WorkoutExercise[] {
  const ids = exerciseSubstitutions[exerciseId] || [];

  return ids
    .map((id) => findExerciseById(id))
    .filter(
      (exercise): exercise is WorkoutExercise => exercise !== null
    );
}