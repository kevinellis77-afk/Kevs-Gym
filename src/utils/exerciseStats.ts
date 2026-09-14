import { getSessions } from "./sessionStorage";

export type ExerciseStats = {
  bestWeight: number;
  bestReps: number;
  bestDate: string;
  firstWeight: number;
  lastWeight: number;
  lastReps: number;
  lastRpe: number;
  sessions: number;
  volume: number;
  estimated1RM: number;
};

/**
 * Per-exercise stats across all logged sessions. Extracted from the
 * calculation that used to live inline in Progress.tsx, so both
 * Progress and ExerciseDetail share one source of truth instead of
 * duplicating it.
 *
 * One change from the original inline version: bestReps and bestDate
 * are now tied to the same set that set bestWeight, rather than
 * tracked as an independent max - so "Personal Record: 110kg x 10"
 * always describes one real lift, not the best weight ever combined
 * with the best rep count ever (which could come from different
 * sessions at different weights).
 */
export function getAllExerciseStats(): Record<string, ExerciseStats> {
  const sessions = getSessions();

  const exerciseStats: Record<string, ExerciseStats> = {};

  const oldestToNewest = [...sessions].reverse();

  oldestToNewest.forEach((session: any) => {
    if (!session.exercises) return;

    session.exercises.forEach((exercise: any) => {
      const validSets =
        exercise.sets?.filter((set: any) => Number(set.weight) > 0) || [];

      if (validSets.length === 0) return;

      const maxWeight = Math.max(
        ...validSets.map((set: any) => Number(set.weight))
      );

      const bestSet = validSets.reduce((best: any, current: any) =>
        Number(current.weight) > Number(best.weight) ? current : best
      );

      const volume = validSets.reduce(
        (total: number, set: any) =>
          total + Number(set.weight) * Number(set.reps),
        0
      );

      const estimated1RM = Math.round(
        Number(bestSet.weight) * (1 + Number(bestSet.reps) / 30)
      );

      if (!exerciseStats[exercise.name]) {
        exerciseStats[exercise.name] = {
          firstWeight: maxWeight,
          lastWeight: maxWeight,
          bestWeight: maxWeight,
          bestReps: Number(bestSet.reps),
          bestDate: session.date,
          sessions: 1,
          lastReps: Number(bestSet.reps),
          lastRpe: Number(bestSet.rpe),
          volume,
          estimated1RM,
        };
      } else {
        const stats = exerciseStats[exercise.name];

        if (maxWeight > stats.bestWeight) {
          stats.bestWeight = maxWeight;
          stats.bestReps = Number(bestSet.reps);
          stats.bestDate = session.date;
        }

        stats.lastWeight = maxWeight;
        stats.lastReps = Number(bestSet.reps);
        stats.lastRpe = Number(bestSet.rpe);

        stats.volume += volume;
        stats.estimated1RM = Math.max(stats.estimated1RM, estimated1RM);

        stats.sessions += 1;
      }
    });
  });

  return exerciseStats;
}

export function getExerciseStats(
  exerciseName: string
): ExerciseStats | null {
  return getAllExerciseStats()[exerciseName] || null;
}