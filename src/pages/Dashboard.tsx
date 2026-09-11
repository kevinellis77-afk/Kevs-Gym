import Header from "../components/Header";
import WorkoutCard from "../components/WorkoutCard";
import StatsGrid from "../components/StatsGrid";

import {
  getWorkoutCount,
  getWorkoutStreak,
  getLastWorkoutDaysAgo,
  getLatestSession,
} from "../utils/dashboardStats";

type DashboardProps = {
  onStartWorkout: () => void;
  onViewHistory?: () => void;
  onViewProgress?: () => void;
};

export default function Dashboard({
  onStartWorkout,
  onViewHistory,
  onViewProgress,
}: DashboardProps) {
  const workoutCount = getWorkoutCount();
  const streak = getWorkoutStreak();
  const lastWorkout = getLastWorkoutDaysAgo();
  const latestSession = getLatestSession();

  return (
    <div className="app">
      <Header />

      <WorkoutCard
        title="Workout A"
        exercises={8}
        duration={65}
        onStart={onStartWorkout}
      />

      <StatsGrid
        stats={[
          {
            label: "Workouts",
            value: workoutCount,
          },
          {
            label: "Latest Notes",
            value: latestSession?.notes
              ? latestSession.notes.substring(0, 12)
              : "--",
          },
          {
            label: "Last Workout",
            value:
              workoutCount > 0
                ? `${lastWorkout} day${
                    lastWorkout === 1 ? "" : "s"
                  } ago`
                : "--",
          },
          {
            label: "Streak",
            value: `${streak} day${
              streak === 1 ? "" : "s"
            }`,
          },
        ]}
      />

      {onViewHistory && (
        <button
          className="finish-btn"
          style={{ marginTop: "20px" }}
          onClick={onViewHistory}
        >
          View Workout History
        </button>
      )}

      {onViewProgress && (
        <button
          className="finish-btn"
          style={{ marginTop: "12px" }}
          onClick={onViewProgress}
        >
          View Progress
        </button>
      )}
    </div>
  );
}