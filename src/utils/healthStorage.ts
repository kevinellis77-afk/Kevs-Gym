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