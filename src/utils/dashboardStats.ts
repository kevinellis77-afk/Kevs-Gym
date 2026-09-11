import { getSessions } from "./sessionStorage";

export function getWorkoutCount() {
  return getSessions().length;
}

export function getLatestSession() {
  const sessions = getSessions();

  if (sessions.length === 0) {
    return null;
  }

  return sessions[0];
}

export function getLastWorkoutDaysAgo() {
  const latest = getLatestSession();

  if (!latest) {
    return "--";
  }

  const parts = latest.date.split("/");

  const workoutDate = new Date(
    Number(parts[2]),
    Number(parts[1]) - 1,
    Number(parts[0])
  );

  const today = new Date();

  const diff =
    today.getTime() - workoutDate.getTime();

  return Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );
}

export function getWorkoutStreak() {
  const sessions = getSessions();

  return sessions.length;
}