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

  // Sessions store date as an ISO string (new Date().toISOString()),
  // so parse it directly rather than manually splitting on "/" -
  // that format assumption didn't match how dates are actually saved.
  const workoutDate = new Date(latest.date);

  if (isNaN(workoutDate.getTime())) {
    return "--";
  }

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