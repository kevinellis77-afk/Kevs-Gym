import { getSessions } from "./sessionStorage";
import { sessionTonnage, attachedCardioMinutes } from "./volume";

export type RollupStats = {
  sessionCount: number;
  totalVolume: number;
  cardioMinutes: number;
};

function daysAgo(dateValue: string): number | null {
  const date = new Date(dateValue);

  if (isNaN(date.getTime())) return null;

  const now = new Date();

  return (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
}

/**
 * Kept under its old name so existing imports keep working - the
 * actual rules (timed holds excluded, both sides of unilateral lifts
 * counted) live in utils/volume.ts.
 */
export function sessionVolume(session: any): number {
  return sessionTonnage(session);
}

function summarize(sessions: any[]): RollupStats {
  return {
    sessionCount: sessions.length,
    totalVolume: sessions.reduce(
      (total, session) => total + sessionVolume(session),
      0
    ),
    // Standalone cardio sessions contribute their `duration`; lifting
    // sessions contribute only their attached warm-up/cool-down - a
    // lifting session's own `duration` is lifting time, not cardio.
    cardioMinutes: sessions.reduce(
      (total, session) =>
        total +
        (session.type === "cardio"
          ? Number(session.duration) || 0
          : attachedCardioMinutes(session)),
      0
    ),
  };
}

/**
 * Sessions and total volume for the last `days` days (0-Nth day
 * inclusive of today, exclusive of `days` boundary).
 */
export function getRollup(days: number): RollupStats {
  const sessions = getSessions();

  const inRange = sessions.filter((session: any) => {
    const age = daysAgo(session.date);
    return age !== null && age >= 0 && age < days;
  });

  return summarize(inRange);
}

/**
 * Sessions and total volume for the period immediately before the
 * last `days` days - e.g. getPreviousRollup(7) with the current
 * week being "last 7 days" returns the 7 days before that. Used to
 * show a trend against the prior equivalent period.
 */
export function getPreviousRollup(days: number): RollupStats {
  const sessions = getSessions();

  const inRange = sessions.filter((session: any) => {
    const age = daysAgo(session.date);
    return age !== null && age >= days && age < days * 2;
  });

  return summarize(inRange);
}

export function getWeeklyRollup(): RollupStats {
  return getRollup(7);
}

export function getPreviousWeeklyRollup(): RollupStats {
  return getPreviousRollup(7);
}

export function getMonthlyRollup(): RollupStats {
  return getRollup(30);
}

export function getPreviousMonthlyRollup(): RollupStats {
  return getPreviousRollup(30);
}