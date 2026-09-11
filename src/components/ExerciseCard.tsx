import { useEffect, useState } from "react";
import { getLastExerciseData } from "../utils/lastWorkoutData";

type SetData = {
  weight: string;
  reps: string;
  rpe: string;
};

type Props = {
  name: string;
  targetWeight: number;
  onChange: (
    exerciseName: string,
    sets: SetData[]
  ) => void;
  // Fired only when the user actually edits a field for this exercise —
  // NOT when previous-session data is auto-loaded on mount. Use this
  // (rather than onChange) to track what the user has touched today.
  onInteract?: (exerciseName: string) => void;
};

export default function ExerciseCard({
  name,
  targetWeight,
  onChange,
  onInteract,
}: Props) {
  const previousWorkout = getLastExerciseData(name);

  const cleanWeight = (value: string) =>
    String(value || "").replace(/[^0-9.]/g, "");

  const [sets, setSets] = useState<SetData[]>([
    { weight: "", reps: "", rpe: "" },
    { weight: "", reps: "", rpe: "" },
    { weight: "", reps: "", rpe: "" },
  ]);

  useEffect(() => {
    if (previousWorkout?.sets) {
      const loadedSets = previousWorkout.sets.map(
        (set: SetData) => ({
          weight: cleanWeight(set.weight),
          reps: set.reps || "",
          rpe: set.rpe || "",
        })
      );

      setSets(loadedSets);
      onChange(name, loadedSets);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const updateSet = (
    index: number,
    field: keyof SetData,
    value: string
  ) => {
    const updated = [...sets];
    updated[index][field] = value;
    setSets(updated);
    onChange(name, updated);
    onInteract?.(name);
  };

  const lastWeight = previousWorkout?.sets?.[0]?.weight
    ? cleanWeight(previousWorkout.sets[0].weight)
    : "";

  const lastReps = previousWorkout?.sets?.[0]?.reps || "";

  return (
    <div className="exercise-card">
      <div className="exercise-card-header">
        <h3 className="exercise-name">{name}</h3>
      </div>

      <div className="exercise-meta-row">
        <div className="exercise-meta">
          <span className="exercise-meta-label">Target</span>
          <span className="exercise-meta-value-target">
            {targetWeight}kg
          </span>
        </div>

        {previousWorkout && (
          <div className="exercise-meta">
            <span className="exercise-meta-label">Last Session</span>
            <span className="exercise-meta-value-last">
              {lastWeight}kg &times; {lastReps}
            </span>
          </div>
        )}
      </div>

      <div className="set-table-header">
        <span></span>
        <span>Weight</span>
        <span>Reps</span>
        <span>RPE</span>
      </div>

      {[0, 1, 2].map((index) => (
        <div key={index} className="set-row">
          <span className="set-row-label">Set {index + 1}</span>

          <input
            className="set-input"
            type="number"
            inputMode="decimal"
            step="0.5"
            value={sets[index].weight}
            placeholder="0"
            onChange={(e) =>
              updateSet(index, "weight", cleanWeight(e.target.value))
            }
          />

          <input
            className="set-input"
            type="number"
            inputMode="numeric"
            value={sets[index].reps}
            placeholder="0"
            onChange={(e) => updateSet(index, "reps", e.target.value)}
          />

          <input
            className="set-input"
            type="number"
            inputMode="numeric"
            value={sets[index].rpe}
            placeholder="0"
            onChange={(e) => updateSet(index, "rpe", e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
