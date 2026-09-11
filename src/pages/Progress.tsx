import { getSessions } from "../utils/sessionStorage";

type ProgressProps = {
  onBack?: () => void;
};

export default function Progress({
  onBack,
}: ProgressProps) {
  const sessions = getSessions();

  const exerciseStats: Record<
    string,
    {
      bestWeight: number;
      bestReps: number;
      firstWeight: number;
      lastWeight: number;
      lastReps: number;
      lastRpe: number;
      sessions: number;
      volume: number;
      estimated1RM: number;
    }
  > = {};

  const oldestToNewest = [...sessions].reverse();

  oldestToNewest.forEach((session: any) => {
    if (!session.exercises) return;

    session.exercises.forEach((exercise: any) => {
      const validSets =
        exercise.sets?.filter(
          (set: any) =>
            Number(set.weight) > 0
        ) || [];

      if (validSets.length === 0) return;

      const maxWeight = Math.max(
        ...validSets.map((set: any) =>
          Number(set.weight)
        )
      );

      const bestSet = validSets.reduce(
        (best: any, current: any) =>
          Number(current.weight) >
          Number(best.weight)
            ? current
            : best
      );

      const volume = validSets.reduce(
        (total: number, set: any) =>
          total +
          Number(set.weight) *
            Number(set.reps),
        0
      );

      const estimated1RM = Math.round(
        Number(bestSet.weight) *
          (1 +
            Number(bestSet.reps) / 30)
      );

      if (!exerciseStats[exercise.name]) {
        exerciseStats[exercise.name] = {
          firstWeight: maxWeight,
          lastWeight: maxWeight,
          bestWeight: maxWeight,
          bestReps: Number(bestSet.reps),
          sessions: 1,
          lastReps: Number(bestSet.reps),
          lastRpe: Number(bestSet.rpe),
          volume,
          estimated1RM,
        };
      } else {
        const stats =
          exerciseStats[exercise.name];

        stats.bestWeight = Math.max(
          stats.bestWeight,
          maxWeight
        );

        stats.bestReps = Math.max(
          stats.bestReps,
          Number(bestSet.reps)
        );

        stats.lastWeight = maxWeight;
        stats.lastReps = Number(
          bestSet.reps
        );
        stats.lastRpe = Number(
          bestSet.rpe
        );

        stats.volume += volume;

        stats.estimated1RM = Math.max(
          stats.estimated1RM,
          estimated1RM
        );

        stats.sessions += 1;
      }
    });
  });

  const leaderboard = Object.entries(
    exerciseStats
  ).sort(
    (a, b) =>
      b[1].bestWeight -
      a[1].bestWeight
  );

  return (
    <div className="app">
      <h1>Progress Tracking</h1>

      {leaderboard.map(
        ([exerciseName, stats]) => {
          const improvement =
            stats.bestWeight -
            stats.firstWeight;

          const percentage =
            stats.firstWeight > 0
              ? Math.round(
                  (improvement /
                    stats.firstWeight) *
                    100
                )
              : 0;

          return (
            <div
              key={exerciseName}
              className="exercise-card"
            >
              <h3>
                🏆 {exerciseName}
              </h3>

              <p>
                Personal Record:{" "}
                {stats.bestWeight}kg ×{" "}
                {stats.bestReps}
              </p>

              <p>
                Estimated 1RM:{" "}
                {stats.estimated1RM}kg
              </p>

              <p>
                Total Volume:{" "}
                {stats.volume.toLocaleString()}
                kg
              </p>

              <p>
                Improvement: +
                {improvement}kg (
                {percentage}%)
              </p>

              <p>
                Sessions Logged:{" "}
                {stats.sessions}
              </p>

              <p>
                Last Session:{" "}
                {stats.lastWeight}kg ×{" "}
                {stats.lastReps}
              </p>

              <p>
                Last RPE:{" "}
                {stats.lastRpe}
              </p>
            </div>
          );
        }
      )}

      <h2
        style={{
          marginTop: "30px",
        }}
      >
        Strength Rankings
      </h2>

      {leaderboard.map(
        ([name, stats], index) => (
          <div
            key={name}
            className="exercise-card"
          >
            <strong>
              #{index + 1} {name}
            </strong>

            <p>
              Best Weight:{" "}
              {stats.bestWeight}kg
            </p>

            <p>
              Estimated 1RM:{" "}
              {stats.estimated1RM}kg
            </p>
          </div>
        )
      )}

      {onBack && (
        <button
          className="finish-btn"
          style={{ marginTop: "20px" }}
          onClick={onBack}
        >
          Back to Dashboard
        </button>
      )}
    </div>
  );
}