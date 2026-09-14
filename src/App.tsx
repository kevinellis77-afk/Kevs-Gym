import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import WorkoutSummary from "./pages/WorkoutSummary";
import History from "./pages/History";
import Progress from "./pages/Progress";
import Health from "./pages/Health";
import ExerciseDetail from "./pages/ExerciseDetail";
import BottomNav from "./components/BottomNav";

import { getNextWorkout } from "./utils/workoutRotation";

type NavTab = "dashboard" | "progress" | "history" | "health";
type DetailOrigin = "RECORDS" | "PROGRESS";

export default function App() {
  const [screen, setScreen] =
    useState("dashboard");

  const [summaryData, setSummaryData] =
    useState({
      volume: 0,
      exerciseCount: 0,
      duration: 0,
    });

  const [selectedExercise, setSelectedExercise] =
    useState<string | null>(null);

  const [detailOrigin, setDetailOrigin] =
    useState<DetailOrigin>("RECORDS");

  // Screens that show the bottom tab bar. Workout, its post-session
  // summary, and Exercise Detail are deliberately excluded.
  const NAV_SCREENS: NavTab[] = [
    "dashboard",
    "progress",
    "history",
    "health",
  ];

  const showNav = NAV_SCREENS.includes(screen as NavTab);

  const openExerciseDetail = (
    name: string,
    origin: DetailOrigin
  ) => {
    setSelectedExercise(name);
    setDetailOrigin(origin);
    setScreen("exerciseDetail");
  };

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

  if (screen === "exerciseDetail" && selectedExercise) {
    return (
      <ExerciseDetail
        name={selectedExercise}
        origin={detailOrigin}
        onBack={() =>
          setScreen(
            detailOrigin === "PROGRESS" ? "progress" : "dashboard"
          )
        }
      />
    );
  }

  return (
    <>
      {screen === "history" && <History />}

      {screen === "progress" && (
        <Progress
          onSelectExercise={(name) =>
            openExerciseDetail(name, "PROGRESS")
          }
        />
      )}

      {screen === "health" && <Health />}

      {screen === "dashboard" && (
        <Dashboard
          onStartWorkout={() => setScreen("workout")}
          onSelectExercise={(name) =>
            openExerciseDetail(name, "RECORDS")
          }
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
