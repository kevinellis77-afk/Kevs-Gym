import WorkoutCard from "../components/WorkoutCard";
import ProgressChart from "../components/ProgressChart";

import { getPersonalRecords } from "../utils/personalRecords";

import {
  getWorkoutCount,
  getLastWorkoutDaysAgo,
} from "../utils/dashboardStats";

import { getLatestHealthEntry } from "../utils/healthStats";

import {
  getExerciseHistory,
  getAllExerciseNames,
} from "../utils/progressChartData";

import { getSelectedChartExercise } from "../utils/chartPreference";
import { getNextWorkout } from "../utils/workoutRotation";

type DashboardProps = {
  onStartWorkout: () => void;
  // Optional so this page still renders before App.tsx is wired up
  // for the Exercise Detail screen (that lands in a later batch).
  onSelectExercise?: (name: string) => void;
};

export default function Dashboard({
  onStartWorkout,
  onSelectExercise,
}: DashboardProps) {
  const workoutCount = getWorkoutCount();
  const lastWorkout = getLastWorkoutDaysAgo();

  const health = getLatestHealthEntry();

  const personalRecords = getPersonalRecords();

  const nextWorkout = getNextWorkout();

  const exerciseNames = getAllExerciseNames();
  const selectedExercise = getSelectedChartExercise(
    exerciseNames[0] || "Leg Press"
  );
  const exerciseHistory = getExerciseHistory(selectedExercise);

  const topRecords = Object.entries(personalRecords)
    .sort((a, b) => b[1].best - a[1].best)
    .slice(0, 5);

  const chartFirst =
    exerciseHistory.length > 0 ? exerciseHistory[0].weight : 0;
  const chartLast =
    exerciseHistory.length > 0
      ? exerciseHistory[exerciseHistory.length - 1].weight
      : 0;
  const chartChange = chartLast - chartFirst;

  return (
    <div className="app">
      <div className="brand-bar">
        <span className="brand-bar-name">Kev's Gym</span>
        <span className="brand-bar-meta">Week 03</span>
      </div>

      <WorkoutCard
        workoutName={nextWorkout.name}
        exerciseCount={nextWorkout.exercises.length}
        estimatedMinutes={nextWorkout.estimatedMinutes}
        onStartWorkout={onStartWorkout}
      />

      <div className="metric-grid">
        <div className="metric-cell">
          <span className="metric-label">Sessions</span>
          <div className="metric-value">{workoutCount}</div>
        </div>

        <div className="metric-cell">
          <span className="metric-label">Last Session</span>
          <div className="metric-value">
            {workoutCount > 0
              ? lastWorkout === 0
                ? "Today"
                : `${lastWorkout}d`
              : "--"}
          </div>
        </div>

        <div className="metric-cell">
          <span className="metric-label">Weight</span>
          <div className="metric-value">
            {health ? health.weight : "--"}
            {health && <span className="metric-unit">kg</span>}
          </div>
        </div>

        <div className="metric-cell">
          <span className="metric-label">Blood Pressure</span>
          <div className="metric-value">
            {health ? `${health.systolic}/${health.diastolic}` : "--"}
          </div>
        </div>
      </div>

      <div className="chart-block">
        <div className="chart-head">
          <span className="chart-label">{selectedExercise}</span>

          {exerciseHistory.length > 0 && (
            <span className="chart-delta">
              {chartChange > 0 ? "+" : ""}
              {chartChange}kg
            </span>
          )}
        </div>

        <ProgressChart data={exerciseHistory} height={96} />
      </div>

      <div className="list-header">
        <span className="list-header-label">Records</span>
        <span className="list-header-label">Best &middot; Gain</span>
      </div>

      {topRecords.length === 0 && (
        <p className="empty-state">
          Complete a workout to start tracking records.
        </p>
      )}

      {topRecords.map(([exercise, record]) => (
        <button
          key={exercise}
          className="list-row-clickable"
          onClick={() => onSelectExercise?.(exercise)}
        >
          <span className="list-row-label">{exercise}</span>

          <span className="list-row-value">
            {record.best}kg
            {record.improvement > 0 && (
              <span className="gain">+{record.improvement}kg</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
