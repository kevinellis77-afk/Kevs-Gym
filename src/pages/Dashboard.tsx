import Header from "../components/Header";
import StatCard from "../components/StatCard";

type Props = {
  onStartWorkout: () => void;
};

export default function Dashboard({ onStartWorkout }: Props) {
  return (
    <>
      <Header />

      <div className="workout-card">
        <h2>Workout A</h2>

        <p>8 Exercises • 65 Minutes</p>

        <button onClick={onStartWorkout}>
          Start Workout
        </button>
      </div>

      <div className="stats-grid">
        <StatCard title="Workouts" value="3" />
        <StatCard title="Weight" value="17 st" />
        <StatCard title="BP" value="--" />
        <StatCard title="Streak" value="2" />
      </div>
    </>
  );
}