import { getSessions } from "./sessionStorage";
import { getTrackingType } from "./exerciseMeta";
import { getPairs, isPairedRecord } from "./setFormat";
import {
  attachedCardioMinutes,
  sessionTonnage,
  sessionTimeUnderLoad,
} from "./volume";
import type { CardioBlock, SetData } from "../types/session";

function formatSessionDate(dateValue: string) {
  const parsed = new Date(dateValue);

  if (isNaN(parsed.getTime())) {
    return dateValue;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCardioBlock(block: CardioBlock): string {
  return `${block.cardioType}, ${block.minutes} min, effort ${block.effort}/10`;
}

function formatSetLine(
  set: SetData,
  trackingType: "reps" | "duration"
): string {
  const weight = set.weight || "-";
  const rpe = set.rpe || "-";

  const secondValue =
    trackingType === "duration"
      ? `${set.reps || "-"}s`
      : `${set.reps || "-"} reps`;

  return `${weight}kg x ${secondValue} (RPE ${rpe})`;
}

function formatSessionText(session: any): string {
  const lines: string[] = [];

  lines.push("Kev's Gym - Workout Session");
  lines.push("");

  if (session.workoutName) {
    lines.push(`Workout: ${session.workoutName}`);
  }

  lines.push(`Date: ${formatSessionDate(session.date)}`);

  const cardioMinutes = attachedCardioMinutes(session);

  lines.push(
    cardioMinutes > 0
      ? `Duration: ${session.duration} min + ${cardioMinutes} min cardio`
      : `Duration: ${session.duration} min`
  );

  if (session.notes) {
    lines.push(`Notes: ${session.notes}`);
  }

  if (session.feeling) {
    lines.push(`Feeling: ${session.feeling}`);
  }

  lines.push("");

  if (session.type === "cardio") {
    lines.push(`Type: ${session.cardioType || "-"}`);

    if (session.cardioRpe) {
      lines.push(`Effort: ${session.cardioRpe}/10`);
    }

    return lines.join("\n");
  }

  if (session.warmUp) {
    lines.push(`Warm-up: ${formatCardioBlock(session.warmUp)}`);
  }

  lines.push("Exercises:");

  (session.exercises || []).forEach((exercise: any) => {
    const trackingType = getTrackingType(exercise.name);
    const sets: SetData[] = exercise.sets || [];

    if (isPairedRecord(sets)) {
      lines.push(`- ${exercise.name} (each side)`);

      getPairs(sets).forEach((pair, index) => {
        const left = pair.left ? `L ${formatSetLine(pair.left, trackingType)}` : "L -";
        const right = pair.right ? `R ${formatSetLine(pair.right, trackingType)}` : "R -";
        lines.push(`  Set ${index + 1}: ${left} / ${right}`);
      });

      return;
    }

    lines.push(`- ${exercise.name}`);

    sets.forEach((set, index) => {
      lines.push(`  Set ${index + 1}: ${formatSetLine(set, trackingType)}`);
    });
  });

  if (session.coolDown) {
    lines.push(`Cool-down: ${formatCardioBlock(session.coolDown)}`);
  }

  lines.push("");
  lines.push(`Tonnage: ${(sessionTonnage(session) / 1000).toFixed(1)}t`);

  sessionTimeUnderLoad(session).forEach((row) => {
    lines.push(`Time under load: ${row.name} ${row.sets} (${row.totalText} total)`);
  });

  return lines.join("\n");
}

/**
 * Copies a given session to the clipboard as readable plain text -
 * suitable for pasting into an AI assistant for review, or sharing
 * with a coach.
 */
export async function exportSession(
  session: any
): Promise<boolean> {
  try {
    const text = formatSessionText(session);
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Copies the most recently saved session to the clipboard.
 * Convenient for WorkoutSummary, which runs right after a session
 * is saved but doesn't hold the full session object itself.
 */
export async function exportLatestSession(): Promise<boolean> {
  const sessions = getSessions();

  if (sessions.length === 0) {
    return false;
  }

  return exportSession(sessions[0]);
}
