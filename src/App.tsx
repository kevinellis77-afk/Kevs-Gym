import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import WorkoutSummary from "./pages/WorkoutSummary";
import History from "./pages/History";
import Progress from "./pages/Progress";
import Health from "./pages/Health";

import { getNextWorkout } from "./utils/workoutRotation";

export default function App() {
  const [screen, setScreen] =
    useState("dashboard");

  const [summaryData, setSummaryData] =
    useState({
      volume: 0,
      exerciseCount: 0,
      duration: 0,
    });

  if (screen === "workout") {
    return (
      <Workout
        workout={getNextWorkout()}
        onComplete={(
          volume,
          exerciseCount,
          duration
        ) => {
          setSummaryData({
            volume,
            exerciseCount,
            duration,
          });

          setScreen("summary");
        }}
      />
    );
  }

  if (screen === "summary") {
    return (
      <WorkoutSummary
        volume={summaryData.volume}
        exerciseCount={
          summaryData.exerciseCount
        }
        duration={summaryData.duration}
        onFinish={() =>
          setScreen("dashboard")
        }
      />
    );
  }

  if (screen === "history") {
    return (
      <History
        onBack={() =>
          setScreen("dashboard")
        }
      />
    );
  }

  if (screen === "progress") {
    return (
      <Progress
        onBack={() =>
          setScreen("dashboard")
        }
      />
    );
  }

  if (screen === "health") {
    return (
      <Health
        onBack={() =>
          setScreen("dashboard")
        }
      />
    );
  }

  return (
    <div className="app">
      <Dashboard
        onStartWorkout={() =>
          setScreen("workout")
        }
      />

      <button
        className="finish-btn"
        style={{ marginTop: "12px" }}
        onClick={() =>
          setScreen("history")
        }
      >
        Workout History
      </button>

      <button
        className="finish-btn"
        style={{ marginTop: "12px" }}
        onClick={() =>
          setScreen("progress")
        }
      >
        Progress Tracking
      </button>

      <button
        className="finish-btn"
        style={{ marginTop: "12px" }}
        onClick={() =>
          setScreen("health")
        }
      >
        Health Tracker
      </button>
    </div>
  );
}
