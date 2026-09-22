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

/**
 * Replaces the whole stored sessions list (newest first). Only used
 * by utils/migrations.ts - everything else should add sessions one
 * at a time through saveSession().
 */
export function saveAllSessions(sessions: WorkoutSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}
