import { useState } from "react";

import WorkoutCard from "../components/WorkoutCard";

import { getPersonalRecords } from "../utils/personalRecords";
import { getNextWorkoutTargets } from "../utils/nextWorkoutTargets";

import {
  getWorkoutCount,
  getWorkoutStreak,
  getLastWorkoutDaysAgo,
} from "../utils/dashboardStats";

import {
  getLatestHealthEntry,
  getWeightChange,
} from "../utils/healthStats";

import ProgressChart from "../components/ProgressChart";
import ExercisePicker from "../components/ExercisePicker";
import {
  getExerciseHistory,
  getAllExerciseNames,
} from "../utils/progressChartData";
import {
  getSelectedChartExercise,
  setSelectedChartExercise,
} from "../utils/chartPreference";
import { getNextWorkout } from "../utils/workoutRotation";

type DashboardProps = {
  onStartWorkout: () => void;
};

export default function Dashboard({
  onStartWorkout,
}: DashboardProps) {
  const workoutCount = getWorkoutCount();
  const streak = getWorkoutStreak();
  const lastWorkout = getLastWorkoutDaysAgo();

  const health = getLatestHealthEntry();
  const weightChange = getWeightChange();

  const personalRecords = getPersonalRecords();
  const targets = getNextWorkoutTargets();

  const exerciseNames = getAllExerciseNames();

  const [selectedExercise, setSelectedExercise] = useState(
    getSelectedChartExercise(exerciseNames[0] || "Leg Press")
  );

  const handleExerciseChange = (name: string) => {
    setSelectedExercise(name);
    setSelectedChartExercise(name);
  };

  const exerciseHistory = getExerciseHistory(selectedExercise);
  const nextWorkout = getNextWorkout();

  const topRecords = Object.entries(personalRecords)
    .sort((a, b) => b[1].best - a[1].best)
    .slice(0, 5);

  const strengthGain = Object.values(personalRecords).reduce(
    (total: number, record: any) => total + (record.improvement || 0),
    0
  );

  const weightTrendClass =
    weightChange < 0 ? "trend-up" : weightChange > 0 ? "trend-down" : "trend-flat";

  const strengthTrendClass =
    strengthGain > 0 ? "trend-up" : "trend-flat";

  return (
    <div className="app">
      {/* 1. HERO */}

      <div className="hero-card">
        <div className="hero-label">Week 3 Training Block</div>

        <h1 className="hero-title">Kev's Gym</h1>

        <p className="hero-text">
          Building strength, improving cardiovascular health and
          maintaining consistency.
        </p>

        <div className="hero-metrics">
          <div>
            <span className="hero-metric-label">Weight</span>
            <span className="hero-metric-value">
              {health ? `${health.weight}kg` : "--"}
            </span>
          </div>

          <div>
            <span className="hero-metric-label">Blood Pressure</span>
            <span className="hero-metric-value">
              {health ? `${health.systolic}/${health.diastolic}` : "--"}
            </span>
          </div>

          <div>
            <span className="hero-metric-label">Sessions</span>
            <span className="hero-metric-value">{workoutCount}</span>
          </div>

          <div>
            <span className="hero-metric-label">Last Workout</span>
            <span className="hero-metric-value">
              {workoutCount > 0
                ? lastWorkout === 0
                  ? "Today"
                  : `${lastWorkout}d ago`
                : "--"}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PROGRESS SUMMARY */}

      <div className="card">
        <h2 className="section-heading">Progress Summary</h2>

        <div className="summary-grid">
          <div className="summary-tile">
            <span className="summary-tile-label">Weight</span>
            <div className="summary-tile-value">
              {weightChange > 0 ? `+${weightChange}` : weightChange}kg
            </div>
            <span className={weightTrendClass}>
              {weightChange === 0
                ? "Stable"
                : weightChange < 0
                ? "Trending down"
                : "Trending up"}
            </span>
          </div>

          <div className="summary-tile">
            <span className="summary-tile-label">Strength</span>
            <div className="summary-tile-value">
              {strengthGain > 0 ? `+${strengthGain}` : strengthGain}kg
            </div>
            <span className={strengthTrendClass}>
              {strengthGain > 0 ? "Improving" : "Steady"}
            </span>
          </div>

          <div className="summary-tile">
            <span className="summary-tile-label">Consistency</span>
            <div className="summary-tile-value">{streak}</div>
            <span className="trend-flat">
              {streak === 1 ? "day streak" : "day streak"}
            </span>
          </div>
        </div>
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

      {/* 3. TODAY'S WORKOUT */}

      <WorkoutCard
        workoutName={nextWorkout.name}
        exerciseCount={nextWorkout.exercises.length}
        estimatedMinutes={nextWorkout.estimatedMinutes}
        onStartWorkout={onStartWorkout}
      />

      {/* 4. HEALTH SNAPSHOT */}

      <div className="card">
        <h2 className="section-heading">Health Snapshot</h2>

        <div className="health-grid-display">
          <div className="health-metric">
            <span className="health-metric-label">Weight</span>
            <div className="health-metric-value">
              {health ? health.weight : "--"}
              <span className="health-metric-unit">kg</span>
            </div>
          </div>

          <div className="health-metric">
            <span className="health-metric-label">Waist</span>
            <div className="health-metric-value">
              {health ? health.waist : "--"}
              <span className="health-metric-unit">in</span>
            </div>
          </div>

          <div className="health-metric">
            <span className="health-metric-label">Blood Pressure</span>
            <div className="health-metric-value">
              {health ? `${health.systolic}/${health.diastolic}` : "--"}
            </div>
          </div>

          <div className="health-metric">
            <span className="health-metric-label">Resting HR</span>
            <div className="health-metric-value">
              {health ? health.restingHr : "--"}
              <span className="health-metric-unit">bpm</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. PERSONAL RECORDS */}

      <div className="card">
        <h2 className="section-heading">Personal Records</h2>

        {topRecords.length === 0 && (
          <p className="empty-state">
            Complete a workout to start tracking records.
          </p>
        )}

        {topRecords.map(([exercise, record]) => (
          <div key={exercise} className="list-row">
            <span className="list-row-label">{exercise}</span>

            <div className="list-row-value">
              {record.best}kg
              {record.improvement > 0 && (
                <span className="gain">+{record.improvement}kg</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 6. NEXT TARGETS */}

      <div className="card">
        <h2 className="section-heading">Next Workout Targets</h2>

        {targets.length === 0 && (
          <p className="empty-state">
            Complete a workout to generate targets.
          </p>
        )}

        {targets.map((target) => (
          <div key={target.name} className="list-row">
            <span className="list-row-label">{target.name}</span>

            <span className="list-row-target">
              {target.lastWeight}kg &rarr;{" "}
              <strong>{target.targetWeight}kg</strong>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
