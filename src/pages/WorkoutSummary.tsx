type Props = {
  volume: number;
  exerciseCount: number;
  duration: number;
  onFinish: () => void;
};

export default function WorkoutSummary({
  volume,
  exerciseCount,
  duration,
  onFinish,
}: Props) {
  return (
    <div className="app">
      <h1>Workout Complete ✅</h1>

      <div className="exercise-card">
        <p>
          Duration: {duration} mins
        </p>

        <p>
          Exercises: {exerciseCount}
        </p>

        <p>
          Total Volume:{" "}
          {volume.toLocaleString()}kg
        </p>
      </div>

      <button
        className="finish-btn"
        onClick={onFinish}
      >
        Back to Dashboard
      </button>
    </div>
  );
}