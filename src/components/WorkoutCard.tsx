type WorkoutCardProps = {
  onStartWorkout?: () => void;
};

export default function WorkoutCard({
  onStartWorkout,
}: WorkoutCardProps) {
  return (
    <div className="workout-card">
      <span className="workout-card-eyebrow">Today's Workout</span>

      <h2 className="workout-card-title">Workout A</h2>

      <p className="workout-card-meta">8 Exercises &middot; 65 Minutes</p>

      <button className="btn-primary" onClick={onStartWorkout}>
        Start Workout
      </button>
    </div>
  );
}
