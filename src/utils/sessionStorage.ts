import type { WorkoutSession } from "../types/session";

const STORAGE_KEY = "kev-workouts";

export function getSessions(): WorkoutSession[] {
  const data = localStorage.getItem(STORAGE_KEY);

  return data ? JSON.parse(data) : [];
}

export function saveSession(
  session: WorkoutSession
) {
  const existing = getSessions();

  existing.unshift(session);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(existing)
  );
}