import type { HealthEntry } from "../types/health";

const STORAGE_KEY = "kev-health";

export function getHealthEntries(): HealthEntry[] {
  const data =
    localStorage.getItem(STORAGE_KEY);

  return data ? JSON.parse(data) : [];
}

export function saveHealthEntry(
  entry: HealthEntry
) {
  const existing =
    getHealthEntries();

  existing.unshift(entry);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(existing)
  );
}

/**
 * Entries can now be partial (see HealthEntry), so "the latest
 * entry" isn't necessarily the latest entry FOR A GIVEN METRIC - a
 * weight-only entry logged today shouldn't hide last week's blood
 * pressure reading. This walks the entries (newest first, same
 * order as getHealthEntries) and returns the first one that actually
 * has a value for the requested field.
 */
export function getLatestEntryWithField(
  field: keyof Omit<HealthEntry, "id" | "date">
): HealthEntry | null {
  const entries = getHealthEntries();

  return (
    entries.find(
      (entry) => entry[field] !== undefined && entry[field] !== null
    ) ?? null
  );
}