import { useState } from "react";
import ExerciseCard from "../components/ExerciseCard";
import { workoutA } from "../data/workoutA";
import { saveSession } from "../utils/sessionStorage";

type SetData = {
  weight: string;
  reps: string;
  rpe: string;
};

type WorkoutProps = {
  onComplete: (
    volume: number,
    exerciseCount: number,
    duration: number
  ) => void;
};

export default function Workout({
  onComplete,
}: WorkoutProps) {
  const [notes, setNotes] = useState("");

  const [exerciseData, setExerciseData] = useState<
    Record<string, SetData[]>
  >({});

  // Exercises the user has actually edited this session — used only for
  // the progress bar, so pre-loaded last-session data doesn't show as
  // "completed" before it's been touched today.
  const [touchedExercises, setTouchedExercises] = useState<Set<string>>(
    new Set()
  );

  const handleExerciseChange = (
    exerciseName: string,
    sets: SetData[]
  ) => {
    setExerciseData((prev) => ({
      ...prev,
      [exerciseName]: sets,
    }));
  };

  const handleExerciseInteract = (exerciseName: string) => {
    setTouchedExercises((prev) => {
      if (prev.has(exerciseName)) return prev;
      const next = new Set(prev);
      next.add(exerciseName);
      return next;
    });
  };

  const handleSaveWorkout = () => {
    const exercises = Object.entries(exerciseData).map(
      ([name, sets]) => ({
        name,
        sets,
      })
    );

    saveSession({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      notes,
      duration: 65,
      exercises,
    });

    const totalVolume = exercises.reduce(
      (exerciseTotal, exercise) =>
        exerciseTotal +
        exercise.sets.reduce(
          (setTotal, set) =>
            setTotal +
            Number(set.weight || 0) * Number(set.reps || 0),
          0
        ),
      0
    );

    onComplete(totalVolume, exercises.length, 65);
  };

  const completedCount = touchedExercises.size;
  const totalCount = workoutA.length;
  const progressPercent = totalCount
    ? Math.min(100, Math.round((completedCount / totalCount) * 100))
    : 0;

  return (
    <div className="app">
      <div className="page-header">
        <h1 className="page-title">Workout A</h1>
      </div>

      <div className="workout-progress-card">
        <div className="workout-progress-label">
          <span>
            {completedCount} of {totalCount} exercises completed
          </span>
          <span>{progressPercent}%</span>
        </div>

        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {workoutA.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          name={exercise.name}
          targetWeight={exercise.targetWeight}
          onChange={handleExerciseChange}
          onInteract={handleExerciseInteract}
        />
      ))}

      <textarea
        className="notes-input"
        placeholder="How did today's workout feel?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
      />

      <button className="finish-btn" onClick={handleSaveWorkout}>
        Save Workout
      </button>
    </div>
  );
}
