type WorkoutCardProps = {
  onStartWorkout?: () => void;
};

export default function WorkoutCard({
  onStartWorkout,
}: WorkoutCardProps) {
  return (
    <div className="workout-card">
      <span>Today's Workout</span>

      <h2>Workout A</h2>

      <p>
        8 Exercises • 65 Minutes
      </p>

      <button onClick={onStartWorkout}>
        Start Workout
      </button>
    </div>
  );
}