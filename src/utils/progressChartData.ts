import { getSessions } from "./sessionStorage";

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