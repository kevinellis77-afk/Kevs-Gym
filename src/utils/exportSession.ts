import { getSessions } from "./sessionStorage";
import { getTrackingType } from "./exerciseMeta";

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

function formatSessionText(session: any): string {
  const lines: string[] = [];

  lines.push("Kev's Gym - Workout Session");
  lines.push("");

  if (session.workoutName) {
    lines.push(`Workout: ${session.workoutName}`);
  }

  lines.push(`Date: ${formatSessionDate(session.date)}`);
  lines.push(`Duration: ${session.duration} min`);

  if (session.notes) {
    lines.push(`Notes: ${session.notes}`);
  }

  if (session.feeling) {
    lines.push(`Feeling: ${session.feeling}`);
  }

  lines.push("");
  lines.push("Exercises:");

  (session.exercises || []).forEach((exercise: any) => {
    lines.push(`- ${exercise.name}`);

    const trackingType = getTrackingType(exercise.name);

    (exercise.sets || []).forEach((set: any, index: number) => {
      const weight = set.weight || "-";
      const rpe = set.rpe || "-";

      const secondValue =
        trackingType === "duration"
          ? `${set.reps || "-"}s`
          : `${set.reps || "-"} reps`;

      lines.push(
        `  Set ${index + 1}: ${weight}kg x ${secondValue} (RPE ${rpe})`
      );
    });
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