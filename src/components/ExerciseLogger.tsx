import { useState } from "react";
import { getLastExerciseData } from "../utils/lastWorkoutData";
import { getPersonalRecords } from "../utils/personalRecords";
import RestTimer from "./RestTimer";
import { CheckIcon } from "./icons";
import type { WorkoutExercise } from "../data/workouts";

import { getPairs } from "../utils/setFormat";
import type { SetData } from "../types/session";

type Props = {
  name: string;
  // Resolved by the parent (Workout.tsx): the smart RPE-aware target
  // from getNextWorkoutTargets() when available, falling back to the
  // static exercise.targetWeight otherwise.
  targetWeight: number;
  trackingType?: "reps" | "duration";
  // Done one side at a time - sets are logged as left then right,
  // and one "set" is the pair. See SetData.side in types/session.ts.
  unilateral?: boolean;
  // Sets already logged for this exercise this session, owned by
  // Workout.tsx's exerciseData state.
  sets: SetData[];
  onChange: (exerciseName: string, sets: SetData[]) => void;
  onInteract?: (exerciseName: string) => void;
  // Substitution (Workout.tsx owns the actual swap state - this
  // component just presents the picker and reports taps up).
  originalName: string;
  substitutes: WorkoutExercise[];
  isSubstituted: boolean;
  onSubstitute: (exercise: WorkoutExercise | null) => void;
};

const RPE_OPTIONS = [5, 6, 7, 8, 9, 10];

export default function ExerciseLogger({
  name,
  targetWeight,
  trackingType = "reps",
  unilateral = false,
  sets,
  onChange,
  onInteract,
  originalName,
  substitutes,
  isSubstituted,
  onSubstitute,
}: Props) {
  const previousWorkout = getLastExerciseData(name);
  const personalRecords = getPersonalRecords() as Record<string, { best: number }>;
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

  const [showRest, setShowRest] = useState(false);
  const [showSwap, setShowSwap] = useState(false);

  // Original always appears first when currently substituted (as a
  // "revert" option), then whichever alternatives aren't the exercise
  // currently active - so you can swap again or switch back, but
  // never see the one you're already on offered as an option.
  const swapOptions: { key: string; label: string; exercise: WorkoutExercise | null }[] =
    substitutes
      .filter((exercise) => exercise.name !== name)
      .map((exercise) => ({
        key: exercise.id,
        label: exercise.name,
        exercise,
      }));

  if (isSubstituted) {
    swapOptions.unshift({
      key: "original",
      label: originalName,
      exercise: null,
    });
  }

  const handleSwapTap = (exercise: WorkoutExercise | null) => {
    onSubstitute(exercise);
    setShowSwap(false);
  };

  // Unilateral: which side the next LOG SET records. Follows the last
  // logged set rather than just counting, so it stays right even if
  // the sets list ever has an odd one out.
  const lastSide = sets.length > 0 ? sets[sets.length - 1].side : undefined;
  const nextSide: "left" | "right" = lastSide === "left" ? "right" : "left";

  // The set number shown on the button - for unilateral lifts that's
  // the pair number, so left and right of the same set share it.
  const pairs = unilateral ? getPairs(sets) : [];
  const nextSetNumber = unilateral
    ? nextSide === "right"
      ? pairs.length
      : pairs.length + 1
    : sets.length + 1;

  const handleLogSet = () => {
    const newSet: SetData = {
      weight: String(weight),
      reps: String(reps),
      rpe: String(rpe),
      ...(unilateral && { side: nextSide }),
    };

    onChange(name, [...sets, newSet]);
    onInteract?.(name);

    // Unilateral: rest only once both sides are done. Logging a left
    // straight after a right means the rest was cut short, so close
    // any timer still showing rather than leave it running over the
    // next pair.
    setShowRest(unilateral ? nextSide === "right" : true);
  };

  const formatSetValue = (set: SetData) =>
    trackingType === "duration"
      ? `${set.weight}kg for ${set.reps}s`
      : `${set.weight}kg \u00d7 ${set.reps}`;

  return (
    <>
      <h2 className="exercise-poster-title">{name}</h2>

      {unilateral && (
        <span
          className="tag-outline-ink"
          style={{ display: "inline-block", margin: "10px 0 0 16px" }}
        >
          Each Side &middot; Left Then Right
        </span>
      )}

      {isSubstituted && (
        <span
          className="tag-ink"
          style={{ display: "inline-block", margin: "10px 0 0 16px" }}
        >
          Swapped from {originalName}
        </span>
      )}

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

      {substitutes.length > 0 && (
        <>
          <button
            className="btn-ghost btn-ghost-ruled"
            onClick={() => setShowSwap((s) => !s)}
          >
            {isSubstituted ? "Change Substitute" : "Swap Exercise"}
          </button>

          {showSwap && (
            <div className="chip-row">
              {swapOptions.map((option) => (
                <button
                  key={option.key}
                  className="chip"
                  onClick={() => handleSwapTap(option.exercise)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}

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

      {showRest && (
        <RestTimer
          key={sets.length}
          onDone={() => setShowRest(false)}
        />
      )}

      {!unilateral &&
        sets.map((set, index) => (
          <div key={index} className="list-row">
            <span className="set-log-label">Set {index + 1}</span>

            <span className="set-log-value">
              {formatSetValue(set)}
              {set.rpe && ` \u00b7 RPE ${set.rpe}`}
            </span>
          </div>
        ))}

      {unilateral &&
        pairs.map((pair, index) => (
          <div key={index} className="list-row">
            <span className="set-log-label">Set {index + 1}</span>

            <span className="set-log-value">
              {pair.left ? `L ${formatSetValue(pair.left)}` : "L \u2014"}
              {" \u00b7 "}
              {pair.right ? `R ${formatSetValue(pair.right)}` : "R \u2014"}
              {pair.left &&
                pair.right &&
                ` \u00b7 RPE ${Math.max(Number(pair.left.rpe) || 0, Number(pair.right.rpe) || 0)}`}
            </span>
          </div>
        ))}

      <button className="btn-primary" onClick={handleLogSet}>
        Log Set {nextSetNumber}
        {unilateral && (nextSide === "left" ? " \u00b7 Left" : " \u00b7 Right")}
        <CheckIcon />
      </button>
    </>
  );
}