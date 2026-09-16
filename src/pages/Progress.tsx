import { useState } from "react";

import { getAllExerciseStats } from "../utils/exerciseStats";
import {
  getExerciseHistory,
  getAllExerciseNames,
} from "../utils/progressChartData";
import { getTrackingType } from "../utils/exerciseMeta";
import {
  getSelectedChartExercise,
  setSelectedChartExercise,
} from "../utils/chartPreference";
import {
  getWeeklyRollup,
  getPreviousWeeklyRollup,
  getMonthlyRollup,
  getPreviousMonthlyRollup,
} from "../utils/progressRollups";
import ProgressChart from "../components/ProgressChart";

type ProgressProps = {
  onSelectExercise?: (name: string) => void;
};

function trendText(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0
      ? "First activity logged"
      : "No activity yet";
  }

  const change = Math.round(
    ((current - previous) / previous) * 100
  );

  if (change === 0) return "Same as previous period";

  return `${change > 0 ? "+" : ""}${change}% vs previous`;
}

export default function Progress({
  onSelectExercise,
}: ProgressProps) {
  const exerciseStats = getAllExerciseStats();

  const leaderboard = Object.entries(exerciseStats).sort(
    (a, b) => b[1].bestWeight - a[1].bestWeight
  );

  const exerciseNames = getAllExerciseNames();

  const [selectedExercise, setSelectedExerciseState] = useState(
    getSelectedChartExercise(exerciseNames[0] || "Leg Press")
  );

  const handleExerciseChange = (name: string) => {
    setSelectedExerciseState(name);
    setSelectedChartExercise(name);
  };

  const exerciseHistory = getExerciseHistory(selectedExercise);

  const chartFirst =
    exerciseHistory.length > 0 ? exerciseHistory[0].weight : 0;
  const chartBest =
    exerciseHistory.length > 0
      ? Math.max(...exerciseHistory.map((point) => point.weight))
      : 0;
  const chartImprovement = chartBest - chartFirst;
  const chartPct =
    chartFirst > 0
      ? Math.round((chartImprovement / chartFirst) * 100)
      : 0;

  const weekly = getWeeklyRollup();
  const previousWeekly = getPreviousWeeklyRollup();
  const monthly = getMonthlyRollup();
  const previousMonthly = getPreviousMonthlyRollup();

  const weeklyImproved =
    previousWeekly.totalVolume > 0 &&
    weekly.totalVolume >= previousWeekly.totalVolume;
  const monthlyImproved =
    previousMonthly.totalVolume > 0 &&
    monthly.totalVolume >= previousMonthly.totalVolume;

  const weeklyCardioImproved =
    previousWeekly.cardioMinutes > 0 &&
    weekly.cardioMinutes >= previousWeekly.cardioMinutes;
  const monthlyCardioImproved =
    previousMonthly.cardioMinutes > 0 &&
    monthly.cardioMinutes >= previousMonthly.cardioMinutes;

  return (
    <div className="app">
      <div className="screen-head">
        <h1 className="screen-title">Progress</h1>
      </div>

      <div className="metric-grid">
        <div className="metric-cell">
          <span className="metric-label">This Week</span>
          <div className="metric-value-sm">
            {weekly.totalVolume.toLocaleString()}kg
          </div>
          <span
            className={
              "metric-delta" + (weeklyImproved ? "" : " metric-delta-muted")
            }
          >
            {trendText(weekly.totalVolume, previousWeekly.totalVolume)}
          </span>
        </div>

        <div className="metric-cell">
          <span className="metric-label">This Month</span>
          <div className="metric-value-sm">
            {monthly.totalVolume.toLocaleString()}kg
          </div>
          <span
            className={
              "metric-delta" +
              (monthlyImproved ? "" : " metric-delta-muted")
            }
          >
            {trendText(monthly.totalVolume, previousMonthly.totalVolume)}
          </span>
        </div>

        <div className="metric-cell">
          <span className="metric-label">Cardio This Week</span>
          <div className="metric-value-sm">
            {weekly.cardioMinutes.toLocaleString()} min
          </div>
          <span
            className={
              "metric-delta" +
              (weeklyCardioImproved ? "" : " metric-delta-muted")
            }
          >
            {trendText(weekly.cardioMinutes, previousWeekly.cardioMinutes)}
          </span>
        </div>

        <div className="metric-cell">
          <span className="metric-label">Cardio This Month</span>
          <div className="metric-value-sm">
            {monthly.cardioMinutes.toLocaleString()} min
          </div>
          <span
            className={
              "metric-delta" +
              (monthlyCardioImproved ? "" : " metric-delta-muted")
            }
          >
            {trendText(monthly.cardioMinutes, previousMonthly.cardioMinutes)}
          </span>
        </div>
      </div>

      <div className="chip-row">
        {exerciseNames.map((name) => (
          <button
            key={name}
            className={
              "chip" + (name === selectedExercise ? " chip-active" : "")
            }
            onClick={() => handleExerciseChange(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="chart-block">
        <div className="chart-head">
          <span className="chart-label">
            {chartFirst} &rarr; {chartBest} KG
          </span>

          {exerciseHistory.length > 0 && (
            <span className="chart-delta">
              {chartImprovement > 0 ? "+" : ""}
              {chartImprovement}kg &middot; {chartPct}%
            </span>
          )}
        </div>

        <ProgressChart data={exerciseHistory} height={110} />
      </div>

      <div className="rank-table-header">
        <span>#</span>
        <span>Lift</span>
        <span style={{ textAlign: "right" }}>Best</span>
        <span style={{ textAlign: "right" }}>1RM</span>
      </div>

      {leaderboard.length === 0 && (
        <p className="empty-state">
          Log a workout to start building your strength rankings.
        </p>
      )}

      {leaderboard.map(([exerciseName, stats], index) => {
        const trackingType = getTrackingType(exerciseName);

        return (
          <button
            key={exerciseName}
            className="rank-table-row"
            onClick={() => onSelectExercise?.(exerciseName)}
          >
            <span
              className={
                "rank-table-rank" +
                (index === 0 ? " rank-table-rank-first" : "")
              }
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <span className="rank-table-name">{exerciseName}</span>

            <span className="rank-table-best">{stats.bestWeight}kg</span>

            <span className="rank-table-1rm">
              {trackingType === "duration"
                ? "--"
                : `${stats.estimated1RM}kg`}
            </span>
          </button>
        );
      })}
    </div>
  );
}