import { useState } from "react";

import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import History from "./pages/History";
import Progress from "./pages/Progress";
import Health from "./pages/Health";

export default function App() {
  const [screen, setScreen] = useState(
    "dashboard"
  );

  if (screen === "workout") {
    return <Workout />;
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