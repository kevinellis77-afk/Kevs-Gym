import { getSessions } from "./sessionStorage";

export function getPersonalRecords() {
  const sessions = getSessions();

  const records: Record<
    string,
    {
      best: number;
      first: number;
      improvement: number;
    }
  > = {};

  const oldestToNewest = [...sessions].reverse();

  oldestToNewest.forEach((session: any) => {
    if (!session.exercises) return;

    session.exercises.forEach((exercise: any) => {
      if (!exercise.sets) return;

      const weights = exercise.sets
        .map((set: any) => Number(set.weight))
        .filter((weight: number) => weight > 0);

      if (weights.length === 0) return;

      const maxWeight = Math.max(...weights);

      if (!records[exercise.name]) {
        records[exercise.name] = {
          best: maxWeight,
          first: maxWeight,
          improvement: 0,
        };
      } else {
        records[exercise.name].best = Math.max(
          records[exercise.name].best,
          maxWeight
        );
      }
    });
  });

  Object.keys(records).forEach((exercise) => {
    records[exercise].improvement =
      records[exercise].best -
      records[exercise].first;
  });

  return records;
}