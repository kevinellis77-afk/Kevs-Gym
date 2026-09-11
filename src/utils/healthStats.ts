import { getHealthEntries } from "./healthStorage";

export function getLatestHealthEntry() {
  const entries = getHealthEntries();

  return entries.length > 0
    ? entries[0]
    : null;
}

export function getWeightChange() {
  const entries = getHealthEntries();

  if (entries.length < 2) {
    return 0;
  }

  const latest = entries[0].weight;

  const oldest =
    entries[entries.length - 1].weight;

  return Number(
    (latest - oldest).toFixed(1)
  );
}