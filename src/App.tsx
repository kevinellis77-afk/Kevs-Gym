import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";
import History from "./pages/History";

export default function App() {
  const [screen, setScreen] = useState("dashboard");

  if (screen === "workout") {
    return <Workout />;
  }

  if (screen === "history") {
    return <History />;
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
        style={{ marginTop: "20px" }}
        onClick={() =>
          setScreen("history")
        }
      >
        View Workout History
      </button>
    </div>
  );
}