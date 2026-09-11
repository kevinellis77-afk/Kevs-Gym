import { getSessions } from "./sessionStorage";

export function getLastExerciseData(
  exerciseName: string
) {
  const sessions = getSessions();

  if (sessions.length === 0) {
    return null;
  }

  const latestSession = sessions[0];

  console.log(
    "Latest session exercises:",
    latestSession.exercises
  );

  const exercise =
    latestSession.exercises.find(
      (e: any) =>
        e.name === exerciseName
    );

  console.log(
    exerciseName,
    exercise
  );

  return exercise || null;
}