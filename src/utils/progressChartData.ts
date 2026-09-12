import { getSessions } from "./sessionStorage";
import { workouts } from "../data/workouts";

export function getExerciseHistory(
  exerciseName: string
) {
  const sessions = getSessions();

  const history: {
    date: string;
    weight: number;
  }[] = [];

  [...sessions]
    .reverse()
    .forEach((session: any) => {
      if (!session.exercises) return;

      const exercise =
        session.exercises.find(
          (e: any) =>
            e.name === exerciseName
        );

      if (!exercise) return;

      const weights =
        exercise.sets
          ?.map((set: any) =>
            Number(set.weight)
          )
          .filter(
            (weight: number) =>
              weight > 0
          ) || [];

      if (
        weights.length === 0
      )
        return;

      history.push({
        date: session.date,
        weight: Math.max(
          ...weights
        ),
      });
    });

  return history;
}

/**
 * Every exercise name across all workouts in the rotation
 * (deduplicated, alphabetical) — used to populate the exercise
 * picker for the progress chart.
 */
export function getAllExerciseNames(): string[] {
  const names = new Set<string>();

  workouts.forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      names.add(exercise.name);
    });
  });

  return Array.from(names).sort();
}