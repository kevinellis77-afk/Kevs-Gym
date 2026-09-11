import WorkoutCard from "./WorkoutCard";
import StatsGrid from "./StatsGrid";

export default function Dashboard() {
  return (
    <>
      <header>
        <h1>Kev</h1>

        <p>
          Stronger habits.
          Healthier future.
        </p>
      </header>

      <WorkoutCard />

      <StatsGrid />
    </>
  );
}