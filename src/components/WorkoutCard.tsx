type WorkoutCardProps = {
  title: string;
  exercises: number;
  duration: number;
  onStart: () => void;
};

export default function WorkoutCard({
  title,
  exercises,
  duration,
  onStart,
}: WorkoutCardProps) {
  return (
    <div className="workout-card">
      <span>Today's Workout</span>

      <h2>{title}</h2>

      <p>
        {exercises} Exercises • {duration} Minutes
      </p>

      <button onClick={onStart}>
        Start Workout
      </button>
    </div>
  );
}