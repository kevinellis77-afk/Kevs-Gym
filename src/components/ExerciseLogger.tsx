import { useState } from "react";
import { getLastExerciseData } from "../utils/lastWorkoutData";
import { getPersonalRecords } from "../utils/personalRecords";
import { CheckIcon } from "./icons";

type SetData = {
  weight: string;
  reps: string;
  rpe: string;
};

type Props = {
  name: string;
  // Resolved by the parent (Workout.tsx): the smart RPE-aware target
  // from getNextWorkoutTargets() when available, falling back to the
  // static exercise.targetWeight otherwise.
  targetWeight: number;
  trackingType?: "reps" | "duration";
  // Sets already logged for this exercise this session, owned by
  // Workout.tsx's exerciseData state.
  sets: SetData[];
  onChange: (exerciseName: string, sets: SetData[]) => void;
  onInteract?: (exerciseName: string) => void;
};

const RPE_OPTIONS = [5, 6, 7, 8, 9, 10];

export default function ExerciseLogger({
  name,
  targetWeight,
  trackingType = "reps",
  sets,
  onChange,
  onInteract,
}: Props) {
  const previousWorkout = getLastExerciseData(name);
  const personalRecords = getPersonalRecords() as Record<
    string,
    { best: number }
  >;
  const record = personalRecords[name];

  const cleanWeight = (value: string) =>
    String(value || "").replace(/[^0-9.]/g, "");

  // Seeded once on mount from last session's data, falling back to
  // targetWeight/10/8. This component remounts fresh (via `key`) each
  // time the pager moves to a different exercise, so a lazy useState
  // initializer is all that's needed - no effect required.
  const [weight, setWeight] = useState<number>(() => {
    const prevWeight = previousWorkout?.sets?.[0]?.weight;
    return prevWeight ? Number(cleanWeight(prevWeight)) : targetWeight;
  });

  const [reps, setReps] = useState<number>(() => {
    const prevReps = previousWorkout?.sets?.[0]?.reps;
    return prevReps ? Number(prevReps) : 10;
  });

  const [rpe, setRpe] = useState<number>(() => {
    const prevRpe = previousWorkout?.sets?.[0]?.rpe;
    return prevRpe ? Number(prevRpe) : 8;
  });

  const lastWeight = previousWorkout?.sets?.[0]?.weight
    ? cleanWeight(previousWorkout.sets[0].weight)
    : "";
  const lastReps = previousWorkout?.sets?.[0]?.reps || "";

  const handleLogSet = () => {
    const newSet: SetData = {
      weight: String(weight),
      reps: String(reps),
      rpe: String(rpe),
    };

    onChange(name, [...sets, newSet]);
    onInteract?.(name);
  };

  return (
    <>
      <h2 className="exercise-poster-title">{name}</h2>

      <div className="exercise-meta-row">
        <div>
          <span className="exercise-meta-label">Target</span>
          <span className="exercise-meta-value exercise-meta-value-target">
            {targetWeight}kg
          </span>
        </div>

        <div>
          <span className="exercise-meta-label">Last</span>
          <span className="exercise-meta-value">
            {previousWorkout
              ? trackingType === "duration"
                ? `${lastWeight}kg for ${lastReps}s`
                : `${lastWeight}kg \u00d7 ${lastReps}`
              : "--"}
          </span>
        </div>

        <div>
          <span className="exercise-meta-label">Best</span>
          <span className="exercise-meta-value">
            {record ? `${record.best}kg` : "--"}
          </span>
        </div>
      </div>

      <div className="stepper-row">
        <div className="stepper-cell">
          <span className="stepper-label">Weight &middot; KG</span>

          <div className="stepper-controls">
            <button
              className="btn-stepper"
              onClick={() => setWeight((w) => Math.max(0, w - 2.5))}
              aria-label="Decrease weight"
            >
              &minus;
            </button>

            <span className="stepper-value">{weight}</span>

            <button
              className="btn-stepper"
              onClick={() => setWeight((w) => w + 2.5)}
              aria-label="Increase weight"
            >
              +
            </button>
          </div>
        </div>

        <div className="stepper-cell">
          <span className="stepper-label">
            {trackingType === "duration" ? "Duration \u00b7 Sec" : "Reps"}
          </span>

          <div className="stepper-controls">
            <button
              className="btn-stepper"
              onClick={() => setReps((r) => Math.max(1, r - 1))}
              aria-label="Decrease"
            >
              &minus;
            </button>

            <span className="stepper-value">{reps}</span>

            <button
              className="btn-stepper"
              onClick={() => setReps((r) => r + 1)}
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <span className="rpe-block-label">RPE</span>

      <div className="rpe-grid">
        {RPE_OPTIONS.map((value) => (
          <button
            key={value}
            className={
              "rpe-btn" + (rpe === value ? " rpe-btn-active" : "")
            }
            onClick={() => setRpe(value)}
          >
            {value}
          </button>
        ))}
      </div>

      {sets.length > 0 &&
        sets.map((set, index) => (
          <div key={index} className="list-row">
            <span className="set-log-label">Set {index + 1}</span>

            <span className="set-log-value">
              {trackingType === "duration"
                ? `${set.weight}kg for ${set.reps}s`
                : `${set.weight}kg \u00d7 ${set.reps}`}
              {set.rpe && ` \u00b7 RPE ${set.rpe}`}
            </span>
          </div>
        ))}

      <button className="btn-primary" onClick={handleLogSet}>
        Log Set {sets.length + 1}
        <CheckIcon />
      </button>
    </>
  );
}
