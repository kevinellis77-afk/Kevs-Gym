type WorkoutCardProps = {
  workoutName: string;
  exerciseCount: number;
  estimatedMinutes: number;
  onStartWorkout?: () => void;
};

export default function WorkoutCard({
  workoutName,
  exerciseCount,
  estimatedMinutes,
  onStartWorkout,
}: WorkoutCardProps) {
  return (
    <div className="workout-card">
      <span className="workout-card-eyebrow">Today's Workout</span>

      <h2 className="workout-card-title">{workoutName}</h2>

      <p className="workout-card-meta">
        {exerciseCount} Exercises &middot; {estimatedMinutes} Minutes
      </p>

      <button className="btn-primary" onClick={onStartWorkout}>
        Start Workout
      </button>
    </div>
  );
}
