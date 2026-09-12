const STORAGE_KEY = "kev-gym-chart-exercise";

/**
 * Which exercise the progress chart is currently tracking.
 * Shared between Dashboard and Progress so picking one on either
 * page keeps them in sync.
 */
export function getSelectedChartExercise(fallback: string): string {
  return localStorage.getItem(STORAGE_KEY) || fallback;
}

export function setSelectedChartExercise(name: string) {
  localStorage.setItem(STORAGE_KEY, name);
}