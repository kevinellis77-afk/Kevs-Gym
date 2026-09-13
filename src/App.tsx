import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import WorkoutSummary from "./pages/WorkoutSummary";
import History from "./pages/History";
import Progress from "./pages/Progress";
import Health from "./pages/Health";
import BottomNav from "./components/BottomNav";

import { getNextWorkout } from "./utils/workoutRotation";

type NavTab = "dashboard" | "progress" | "history" | "health";

export default function App() {
  const [screen, setScreen] =
    useState("dashboard");

  const [summaryData, setSummaryData] =
    useState({
      volume: 0,
      exerciseCount: 0,
      duration: 0,
    });

  // Screens that show the bottom tab bar. Workout and its post-session
  // summary are deliberately excluded - see workout screen below.
  const NAV_SCREENS: NavTab[] = [
    "dashboard",
    "progress",
    "history",
    "health",
  ];

  const showNav = NAV_SCREENS.includes(screen as NavTab);

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

  return (
    <>
      {screen === "history" && <History />}

      {screen === "progress" && <Progress />}

      {screen === "health" && <Health />}

      {screen === "dashboard" && (
        <Dashboard
          onStartWorkout={() => setScreen("workout")}
        />
      )}

      {showNav && (
        <BottomNav
          active={screen as NavTab}
          onNavigate={(tab) => setScreen(tab)}
        />
      )}
    </>
  );
}
