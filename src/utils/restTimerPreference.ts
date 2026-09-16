const STORAGE_KEY = "kev-rest-duration";
const DEFAULT_DURATION_SECONDS = 90;

export function getRestDuration(): number {
  const stored = localStorage.getItem(STORAGE_KEY);
  const parsed = stored ? Number(stored) : NaN;

  return !isNaN(parsed) && parsed > 0
    ? parsed
    : DEFAULT_DURATION_SECONDS;
}

export function setRestDuration(seconds: number) {
  localStorage.setItem(STORAGE_KEY, String(seconds));
}