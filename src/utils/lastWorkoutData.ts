import { getSessions } from "./sessionStorage";

export function getLastExerciseData(
  exerciseName: string
) {
  const sessions = getSessions();

  if (sessions.length === 0) {
    return null;
  }

  const latestSession = sessions[0];

  if (!latestSession.exercises) {
    return null;
  }

  return (
    latestSession.exercises.find(
      (exercise) =>
        exercise.name === exerciseName
    ) || null
  );
}