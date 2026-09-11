import { getSessions } from "./sessionStorage";

export function getNextWorkoutTargets() {
  const sessions = getSessions();

  if (sessions.length === 0) {
    return [];
  }

  const latestSession = sessions[0];

  const targets: {
    name: string;
    lastWeight: number;
    targetWeight: number;
  }[] = [];

  latestSession.exercises?.forEach(
    (exercise: any) => {
      if (!exercise.sets) return;

      const weights = exercise.sets
        .map((set: any) =>
          Number(set.weight)
        )
        .filter(
          (weight: number) =>
            weight > 0
        );

      if (weights.length === 0) return;

      const lastWeight =
        Math.max(...weights);

      let increase = 2.5;

      const lowerBodyExercises = [
        "Leg Press",
        "Leg Extension",
        "Leg Curl",
      ];

      if (
        lowerBodyExercises.includes(
          exercise.name
        )
      ) {
        increase = 5;
      }

      targets.push({
        name: exercise.name,
        lastWeight,
        targetWeight:
          lastWeight + increase,
      });
    }
  );

  return targets;
}