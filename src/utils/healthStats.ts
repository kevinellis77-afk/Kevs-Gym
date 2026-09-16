import { getHealthEntries, getLatestEntryWithField } from "./healthStorage";

/**
 * The single most recent entry, regardless of which fields it has.
 * Kept for callers that just want "when did I last log anything" -
 * for a specific metric's most recent value, use
 * getLatestEntryWithField from healthStorage instead, since the
 * latest entry overall may not carry that metric.
 */
export function getLatestHealthEntry() {
  const entries = getHealthEntries();

  return entries.length > 0
    ? entries[0]
    : null;
}

export function getWeightChange() {
  const weightEntries = getHealthEntries().filter(
    (entry) => entry.weight !== undefined && entry.weight !== null
  );

  if (weightEntries.length < 2) {
    return 0;
  }

  const latest = weightEntries[0].weight as number;

  const oldest =
    weightEntries[weightEntries.length - 1].weight as number;

  return Number(
    (latest - oldest).toFixed(1)
  );
}

/**
 * Latest logged weight, independent of whatever else was or wasn't
 * logged alongside it.
 */
export function getLatestWeight(): number | null {
  return getLatestEntryWithField("weight")?.weight ?? null;
}

/**
 * Latest logged BP reading (systolic + diastolic are always saved
 * as a pair, so finding by "systolic" is enough to get both).
 */
export function getLatestBloodPressure(): {
  systolic: number;
  diastolic: number;
} | null {
  const entry = getLatestEntryWithField("systolic");

  if (!entry || entry.systolic === undefined || entry.diastolic === undefined) {
    return null;
  }

  return { systolic: entry.systolic, diastolic: entry.diastolic };
}