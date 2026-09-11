import Header from "../components/Header";
import WorkoutCard from "../components/WorkoutCard";
import StatsGrid from "../components/StatsGrid";

import { getPersonalRecords } from "../utils/personalRecords";

import {
  getWorkoutCount,
  getWorkoutStreak,
  getLastWorkoutDaysAgo,
} from "../utils/dashboardStats";

import {
  getLatestHealthEntry,
  getWeightChange,
} from "../utils/healthStats";

type DashboardProps = {
  onStartWorkout: () => void;
};

export default function Dashboard({
  onStartWorkout,
}: DashboardProps) {
  const workoutCount =
    getWorkoutCount();

  const streak =
    getWorkoutStreak();

  const lastWorkout =
    getLastWorkoutDaysAgo();

  const health =
    getLatestHealthEntry();

  const weightChange =
    getWeightChange();

  const personalRecords =
    getPersonalRecords();

  return (
    <div className="app">
      <Header />

      <WorkoutCard
        onStartWorkout={
          onStartWorkout
        }
      />

      <StatsGrid
        stats={[
          {
            label: "Weight",
            value: health
              ? `${health.weight}kg`
              : "--",
          },

          {
            label: "Blood Pressure",
            value: health
              ? `${health.systolic}/${health.diastolic}`
              : "--",
          },

          {
            label: "Resting HR",
            value: health
              ? `${health.restingHr}`
              : "--",
          },

          {
            label: "Workouts",
            value: workoutCount,
          },

          {
            label: "Weight Change",
            value:
              weightChange > 0
                ? `+${weightChange}kg`
                : `${weightChange}kg`,
          },

          {
            label: "Streak",
            value: `${streak} days`,
          },

          {
            label: "Last Workout",
            value:
              workoutCount > 0
                ? lastWorkout === 0
                  ? "Today"
                  : `${lastWorkout}d`
                : "--",
          },
        ]}
      />

      <div
        className="exercise-card"
        style={{
          marginTop: "20px",
        }}
      >
        <h3>🏆 Personal Records</h3>

        {Object.entries(
          personalRecords
        )
          .sort(
            (a, b) =>
              b[1].best -
              a[1].best
          )
          .slice(0, 5)
          .map(
            ([exercise, record]) => (
              <div
                key={exercise}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginTop: "12px",
                }}
              >
                <span>
                  {exercise}
                </span>

                <div>
                  <strong>
                    {record.best}kg
                  </strong>

                  {record.improvement >
                    0 && (
                    <span
                      style={{
                        marginLeft:
                          "8px",
                        color:
                          "#22c55e",
                      }}
                    >
                      ↑ +
                      {
                        record.improvement
                      }
                      kg
                    </span>
                  )}
                </div>
              </div>
            )
          )}
      </div>
    </div>
  );
}