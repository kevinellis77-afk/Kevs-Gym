import { getSessions } from "./sessionStorage";
import { getLastWorkoutDaysAgo } from "./dashboardStats";

// Kev's target: 3 sessions/week (he goes when his daughter has
// gymnastics at the same gym, which is 4x/week - 3 is his own goal
// within that, not hers). One hardcoded constant, same pattern as
// WEIGHT_GOAL_KG in Health.tsx - trivial to change here if the
// target changes.
export const WEEKLY_SESSION_TARGET = 3;

// Fixed threshold, not derived from the weekly target - Kev's own
// call on what "something's off" means, so it won't silently shift
// if the target above ever changes.
export const DAYS_OFF_WARNING = 4;

function daysAgo(dateValue: string): number | null {
  const date = new Date(dateValue);

  if (isNaN(date.getTime())) return null;

  const now = new Date();

  return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
}

export type WeekBucket = {
  label: string;
  sessions: number;
};

/**
 * Session counts (lifting + cardio combined, same as the Dashboard's
 * session count) for the last `weeks` rolling 7-day windows, oldest
 * first. Window 0 is "the last 7 days", window 1 is "7-13 days ago",
 * and so on - not calendar weeks, since those would shift confusingly
 * depending on what day you open the app.
 */
export function getRollingWeeklyCounts(weeks = 8): WeekBucket[] {
  const sessions = getSessions();
  const buckets: WeekBucket[] = [];

  for (let i = weeks - 1; i >= 0; i--) {
    const count = sessions.filter((session: any) => {
      const age = daysAgo(session.date);
      return age !== null && age >= i * 7 && age < (i + 1) * 7;
    }).length;

    let label: string;

    if (i === 0) label = "This Week";
    else if (i === 1) label = "Last Week";
    else label = `${i + 1} Weeks Ago`;

    buckets.push({ label, sessions: count });
  }

  return buckets;
}

/**
 * Days since the last logged session (lifting or cardio) - reuses
 * the exact same calendar-date-aware calculation the Dashboard's
 * "Last Session" metric already uses, so the two never disagree.
 */
export function getDaysSinceLastSession(): number | "--" {
  return getLastWorkoutDaysAgo();
}

/**
 * The early-warning signal: true once it's been longer than
 * DAYS_OFF_WARNING since the last session.
 */
export function isOffTrack(): boolean {
  const days = getDaysSinceLastSession();
  return typeof days === "number" && days > DAYS_OFF_WARNING;
}