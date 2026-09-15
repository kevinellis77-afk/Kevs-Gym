import { getHealthEntries } from "./healthStorage";
import { parseHealthDate } from "./parseHealthDate";

type NumericField = "weight" | "waist" | "systolic" | "diastolic" | "restingHr";

/**
 * Finds the entry closest to (but not after) ~4 weeks before the
 * given date. Health entries are logged irregularly, not daily, so
 * this doesn't expect an exact match - it walks back through
 * (newest-first) entries and returns the first one old enough.
 * Falls back to the oldest available entry if history doesn't yet
 * stretch back 4 weeks.
 */
function findReferenceEntry(priorEntries: any[], latestDate: string) {
  const latestTime = parseHealthDate(latestDate).getTime();

  if (isNaN(latestTime)) return null;

  const targetTime = latestTime - 28 * 24 * 60 * 60 * 1000;

  for (const entry of priorEntries) {
    const entryTime = parseHealthDate(entry.date).getTime();

    if (!isNaN(entryTime) && entryTime <= targetTime) {
      return entry;
    }
  }

  return priorEntries.length > 0
    ? priorEntries[priorEntries.length - 1]
    : null;
}

/**
 * Signed difference between the latest health entry and the entry
 * from ~4 weeks prior, for a given field. Returns null when there
 * isn't enough history to compare (fewer than 2 entries).
 */
export function getHealthDelta(field: NumericField): number | null {
  const entries = getHealthEntries();

  if (entries.length < 2) return null;

  const latest = entries[0] as any;
  const reference = findReferenceEntry(entries.slice(1), latest.date);

  if (!reference) return null;

  const diff = Number(latest[field]) - Number(reference[field]);

  return Math.round(diff * 10) / 10;
}