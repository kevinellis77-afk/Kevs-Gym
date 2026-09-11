import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Workout from "./pages/Workout";

export default function App() {
  const [screen, setScreen] = useState("dashboard");

  if (screen === "workout") {
    return <Workout />;
  }

  return (
    <div className="app">
      <Dashboard onStartWorkout={() => setScreen("workout")} />
    </div>
  );
}