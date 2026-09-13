import { getSessions } from "./sessionStorage";
import { getNextWorkout } from "./workoutRotation";

export function getNextWorkoutTargets() {
  const sessions = getSessions();
  const upcomingWorkout = getNextWorkout();

  const targets: {
    name: string;
    lastWeight: number;
    targetWeight: number;
  }[] = [];

  const lowerBodyExercises = [
    "Leg Press",
    "Leg Extension",
    "Seated Leg Curl",
  ];

  upcomingWorkout.exercises.forEach((exercise) => {
    // Find the most recent session that actually logged this exercise -
    // may be several sessions back now that workouts rotate, not just
    // the very last session saved.
    const sessionWithExercise = sessions.find((session: any) =>
      session.exercises?.some(
        (loggedExercise: any) => loggedExercise.name === exercise.name
      )
    );

    if (!sessionWithExercise) return;

    const loggedExercise = sessionWithExercise.exercises.find(
      (e: any) => e.name === exercise.name
    );

    if (!loggedExercise?.sets) return;

    const weights = loggedExercise.sets
      .map((set: any) => Number(set.weight))
      .filter((weight: number) => weight > 0);

    if (weights.length === 0) return;

    const lastWeight = Math.max(...weights);

    const increase = lowerBodyExercises.includes(exercise.name)
      ? 5
      : 2.5;

    targets.push({
      name: exercise.name,
      lastWeight,
      targetWeight: lastWeight + increase,
    });
  });

  return targets;
}