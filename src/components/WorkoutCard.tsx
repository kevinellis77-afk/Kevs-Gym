import { ArrowRightIcon } from "./icons";

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
    <div className="poster">
      <div className="poster-eyebrow">Today</div>

      <h2 className="poster-title">{workoutName}</h2>

      <div className="poster-meta">
        <span>{exerciseCount} Exercises</span>
        <span>{estimatedMinutes} Min</span>
        <span>Next in Rotation</span>
      </div>

      <button
        className="btn-primary-inverse"
        style={{ marginTop: "20px" }}
        onClick={onStartWorkout}
      >
        Start
        <ArrowRightIcon />
      </button>
    </div>
  );
}
