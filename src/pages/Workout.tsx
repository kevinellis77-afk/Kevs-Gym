import { useState } from "react";
import ExerciseLogger from "../components/ExerciseLogger";
import { saveSession } from "../utils/sessionStorage";
import { getNextWorkoutTargets } from "../utils/nextWorkoutTargets";
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from "../components/icons";
import type { WorkoutTemplate } from "../data/workouts";
import type { SetData } from "../types/session";

const FEELING_OPTIONS = [
  "Felt Good",
  "Manageable",
  "Struggled",
  "Something Hurt",
];

type WorkoutProps = {
  workout: WorkoutTemplate;
  onComplete: (
    volume: number,
    exerciseCount: number,
    duration: number
  ) => void;
};

export default function Workout({
  workout,
  onComplete,
}: WorkoutProps) {
  const [notes, setNotes] = useState("");
  const [feeling, setFeeling] = useState<string | null>(null);

  const [exerciseData, setExerciseData] = useState<Record<string, SetData[]>>(
    {}
  );

  // Which exercises have had at least one set logged this session -
  // drives the segment bar. Set inside handleExerciseInteract, called
  // from ExerciseLogger only when LOG SET is actually tapped.
  const [touchedExercises, setTouchedExercises] = useState<Set<string>>(
    new Set()
  );

  const [index, setIndex] = useState(0);

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
      duration: workout.estimatedMinutes,
      exercises,
      workoutId: workout.id,
      workoutName: workout.name,
      ...(feeling && { feeling }),
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

    onComplete(totalVolume, exercises.length, workout.estimatedMinutes);
  };

  const total = workout.exercises.length;
  const currentExercise = workout.exercises[index];
  const isLast = index === total - 1;

  // Smart, RPE-aware target for the exercise currently being logged -
  // falls back to the static exercise.targetWeight when there's not
  // yet enough history to compute one.
  const smartTargets = getNextWorkoutTargets();
  const smartTarget = smartTargets.find(
    (target) => target.name === currentExercise.name
  );
  const resolvedTarget = smartTarget
    ? smartTarget.targetWeight
    : currentExercise.targetWeight;

  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1));
  };

  const goNextOrFinish = () => {
    if (isLast) {
      handleSaveWorkout();
    } else {
      setIndex((i) => Math.min(total - 1, i + 1));
    }
  };

  return (
    <div className="app">
      <div className="pager-head">
        <span className="pager-head-title">{workout.name}</span>
        <span className="pager-head-count">
          {index + 1} / {total}
        </span>
      </div>

      <div
        className="seg-bar"
        style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}
      >
        {workout.exercises.map((exercise, i) => {
          const done = touchedExercises.has(exercise.name);
          const isCurrent = i === index;

          return (
            <div
              key={exercise.id}
              className={
                "seg-cell" +
                (done
                  ? " seg-cell-done"
                  : isCurrent
                  ? " seg-cell-current"
                  : "")
              }
            />
          );
        })}
      </div>

      <ExerciseLogger
        key={currentExercise.id}
        name={currentExercise.name}
        targetWeight={resolvedTarget}
        trackingType={currentExercise.trackingType}
        sets={exerciseData[currentExercise.name] || []}
        onChange={handleExerciseChange}
        onInteract={handleExerciseInteract}
      />

      {isLast && (
        <>
          <span className="field-block-label">How Did That Feel?</span>

          <div className="chip-row">
            {FEELING_OPTIONS.map((option) => (
              <button
                key={option}
                className={
                  "chip" + (feeling === option ? " chip-active" : "")
                }
                onClick={() =>
                  setFeeling(feeling === option ? null : option)
                }
              >
                {option}
              </button>
            ))}
          </div>

          <textarea
            className="input"
            style={{ margin: "16px", width: "calc(100% - 32px)" }}
            placeholder="How did today's workout feel?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </>
      )}

      <div className="pager-footer">
        <button
          className="pager-footer-btn pager-footer-prev"
          onClick={goPrev}
          disabled={index === 0}
        >
          <ArrowLeftIcon size={16} />
          Prev
        </button>

        <button
          className="pager-footer-btn pager-footer-next"
          onClick={goNextOrFinish}
        >
          {isLast ? "Finish" : "Next Lift"}
          {isLast ? <CheckIcon size={16} /> : <ArrowRightIcon size={16} />}
        </button>
      </div>
    </div>
  );
}