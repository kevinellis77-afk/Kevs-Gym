import { useState } from "react";

import { getSessions } from "../utils/sessionStorage";
import {
  getExerciseHistory,
  getAllExerciseNames,
} from "../utils/progressChartData";
import {
  getSelectedChartExercise,
  setSelectedChartExercise,
} from "../utils/chartPreference";
import ProgressChart from "../components/ProgressChart";
import ExercisePicker from "../components/ExercisePicker";

type ProgressProps = {
  onBack: () => void;
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
          sessions: 1,
          lastReps: Number(bestSet.reps),
          lastRpe: Number(bestSet.rpe),
          volume,
          estimated1RM,
        };
      } else {
        const stats = exerciseStats[exercise.name];

        stats.bestWeight = Math.max(stats.bestWeight, maxWeight);
        stats.bestReps = Math.max(stats.bestReps, Number(bestSet.reps));

        stats.lastWeight = maxWeight;
        stats.lastReps = Number(bestSet.reps);
        stats.lastRpe = Number(bestSet.rpe);

        stats.volume += volume;

        stats.estimated1RM = Math.max(stats.estimated1RM, estimated1RM);

        stats.sessions += 1;
      }
    });
  });

  const leaderboard = Object.entries(exerciseStats).sort(
    (a, b) => b[1].bestWeight - a[1].bestWeight
  );

  const exerciseNames = getAllExerciseNames();

  const [selectedExercise, setSelectedExercise] = useState(
    getSelectedChartExercise(exerciseNames[0] || "Leg Press")
  );

  const handleExerciseChange = (name: string) => {
    setSelectedExercise(name);
    setSelectedChartExercise(name);
  };

  const exerciseHistory = getExerciseHistory(selectedExercise);

  return (
    <div className="app">
      <div className="page-header">
        <h1 className="page-title">Progress</h1>
      </div>

      <ExercisePicker
        exercises={exerciseNames}
        value={selectedExercise}
        onChange={handleExerciseChange}
      />

      <ProgressChart
        title={`${selectedExercise} Progress`}
        data={exerciseHistory}
      />

      <div className="card">
        <h2 className="section-heading">Strength Rankings</h2>

        {leaderboard.length === 0 && (
          <p className="empty-state">
            Log a workout to start building your strength rankings.
          </p>
        )}

        {leaderboard.map(([exerciseName, stats], index) => {
          const improvement = stats.bestWeight - stats.firstWeight;
          const percentage =
            stats.firstWeight > 0
              ? Math.round((improvement / stats.firstWeight) * 100)
              : 0;

          return (
            <div
              key={exerciseName}
              className="card"
              style={{ marginBottom: index === leaderboard.length - 1 ? 0 : undefined }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <span className="rank-badge">{index + 1}</span>
                <h3 className="exercise-name">{exerciseName}</h3>
              </div>

              <div className="list-row" style={{ borderBottom: "none", paddingTop: 0 }}>
                <span className="list-row-label">Personal Record</span>
                <span className="list-row-value">
                  {stats.bestWeight}kg &times; {stats.bestReps}
                </span>
              </div>

              <div className="progress-stat-grid">
                <div className="progress-stat">
                  <span className="progress-stat-label">Est. 1RM</span>
                  <div className="progress-stat-value">
                    {stats.estimated1RM}kg
                  </div>
                </div>

                <div className="progress-stat">
                  <span className="progress-stat-label">Total Volume</span>
                  <div className="progress-stat-value">
                    {stats.volume.toLocaleString()}kg
                  </div>
                </div>

                <div className="progress-stat">
                  <span className="progress-stat-label">Improvement</span>
                  <div className="progress-stat-value">
                    {improvement > 0 && (
                      <span className="gain">
                        +{improvement}kg ({percentage}%)
                      </span>
                    )}
                    {improvement <= 0 && <span>{improvement}kg</span>}
                  </div>
                </div>

                <div className="progress-stat">
                  <span className="progress-stat-label">Sessions</span>
                  <div className="progress-stat-value">
                    {stats.sessions}
                  </div>
                </div>
              </div>

              <div
                className="list-row"
                style={{ borderTop: "1px solid var(--card-border)", marginTop: "10px" }}
              >
                <span className="list-row-label">Last Session</span>
                <span className="list-row-value">
                  {stats.lastWeight}kg &times; {stats.lastReps} @ RPE{" "}
                  {stats.lastRpe}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn-secondary" onClick={onBack}>
        Back to Dashboard
      </button>
    </div>
  );
}
