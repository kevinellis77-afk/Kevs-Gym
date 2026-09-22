import { getTrackingType } from "./exerciseMeta";
import type { SetData } from "../types/session";

export type SetPair = {
  left?: SetData;
  right?: SetData;
};

/**
 * True when a saved exercise record was logged as left/right pairs.
 * Checks the sets themselves rather than the exercise definition, so
 * a record always displays the way it was actually logged.
 */
export function isPairedRecord(sets: SetData[]): boolean {
  return sets.some((set) => set.side === "left" || set.side === "right");
}

/**
 * Groups side-tagged sets into left/right pairs. Walks the sets in
 * order rather than just slicing by index, so a missing side (e.g. a
 * workout finished after logging only the left of the final set)
 * shows up as a half pair instead of shifting every pair after it.
 */
export function getPairs(sets: SetData[]): SetPair[] {
  const pairs: SetPair[] = [];

  sets.forEach((set) => {
    const current = pairs[pairs.length - 1];

    if (set.side === "right" && current && !current.right) {
      current.right = set;
    } else if (set.side === "right") {
      pairs.push({ right: set });
    } else {
      pairs.push({ left: set });
    }
  });

  return pairs;
}

/** "17.5kg×10" or, for timed holds, "31kg for 30s". */
export function formatSingleSet(
  set: SetData,
  trackingType: "reps" | "duration"
): string {
  return trackingType === "duration"
    ? `${set.weight}kg for ${set.reps}s`
    : `${set.weight}kg\u00d7${set.reps}`;
}

function sameSet(a?: SetData, b?: SetData): boolean {
  return !!a && !!b && a.weight === b.weight && a.reps === b.reps;
}

function formatPair(
  pair: SetPair,
  trackingType: "reps" | "duration"
): string {
  if (pair.left && pair.right) {
    return sameSet(pair.left, pair.right)
      ? formatSingleSet(pair.left, trackingType)
      : `L ${formatSingleSet(pair.left, trackingType)} / R ${formatSingleSet(pair.right, trackingType)}`;
  }

  if (pair.left) return `L only ${formatSingleSet(pair.left, trackingType)}`;
  if (pair.right) return `R only ${formatSingleSet(pair.right, trackingType)}`;

  return "";
}

/**
 * One-line summary of an exercise's sets, as History, Exercise
 * Detail and the session summary show it.
 *
 * Normal lifts: every set, e.g. "20kg×10 · 20kg×10 · 22.5kg×8".
 *
 * Unilateral lifts: collapsed when every pair matches, e.g.
 * "17.5kg×10 · 3 × each side" or "31kg for 30s · 3 × each side".
 * When pairs differ, each pair is listed (showing L/R only where the
 * two sides differ), followed by the pair count.
 */
export function formatExerciseSets(
  exerciseName: string,
  sets: SetData[]
): string {
  const trackingType = getTrackingType(exerciseName);

  if (!isPairedRecord(sets)) {
    return sets
      .map((set) => formatSingleSet(set, trackingType))
      .join(" \u00b7 ");
  }

  const pairs = getPairs(sets);
  const completePairs = pairs.filter((pair) => pair.left && pair.right);

  const allIdentical =
    completePairs.length === pairs.length &&
    pairs.every(
      (pair) =>
        sameSet(pair.left, pair.right) && sameSet(pair.left, pairs[0].left)
    );

  const countText =
    completePairs.length > 0 ? `${completePairs.length} \u00d7 each side` : "";

  if (allIdentical && pairs.length > 0) {
    return `${formatSingleSet(pairs[0].left as SetData, trackingType)} \u00b7 ${countText}`;
  }

  return [...pairs.map((pair) => formatPair(pair, trackingType)), countText]
    .filter(Boolean)
    .join(" \u00b7 ");
}

/** "3:00" style, for time-under-load totals. */
export function formatSeconds(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
