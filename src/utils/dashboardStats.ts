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

  // Compare calendar dates, not raw elapsed time - a workout logged
  // late last night should read "1d ago" as soon as the date rolls
  // over, even if fewer than 24 hours have technically passed.
  const workoutDay = new Date(
    workoutDate.getFullYear(),
    workoutDate.getMonth(),
    workoutDate.getDate()
  );

  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diff = todayDay.getTime() - workoutDay.getTime();

  return Math.round(diff / (1000 * 60 * 60 * 24));
}

export function getWorkoutStreak() {
  const sessions = getSessions();

  return sessions.length;
}