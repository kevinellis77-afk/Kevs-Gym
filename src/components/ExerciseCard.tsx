import { useEffect, useState } from "react";
import { getLastExerciseData } from "../utils/lastWorkoutData";

type SetData = {
  weight: string;
  reps: string;
  rpe: string;
};

function isSetComplete(set: SetData) {
  return (
    set.weight !== "" &&
    Number(set.weight) > 0 &&
    set.reps !== "" &&
    Number(set.reps) > 0
  );
}

type Props = {
  name: string;
  targetWeight: number;
  trackingType?: "reps" | "duration";
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
  trackingType = "reps",
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

  // Which set rows the user has actually edited this session - kept
  // separate from `sets` itself so a preloaded (last-session) value
  // doesn't render as "complete" before the user has touched it today.
  const [touchedSets, setTouchedSets] = useState<Set<number>>(
    new Set()
  );

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

    setTouchedSets((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
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
              {trackingType === "duration"
                ? `${lastWeight}kg for ${lastReps}s`
                : `${lastWeight}kg \u00d7 ${lastReps}`}
            </span>
          </div>
        )}
      </div>

      <div className="set-table-header">
        <span></span>
        <span>Weight</span>
        <span>{trackingType === "duration" ? "Duration (s)" : "Reps"}</span>
        <span>RPE</span>
      </div>

      {[0, 1, 2].map((index) => {
        const complete =
          isSetComplete(sets[index]) && touchedSets.has(index);

        return (
          <div
            key={index}
            className={
              "set-row" + (complete ? " set-row-complete" : "")
            }
          >
            <span className="set-row-label">
              {complete && (
                <svg
                  className="set-check-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="5 12.5 9.5 17 19 7" />
                </svg>
              )}
              Set {index + 1}
            </span>

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
              placeholder={trackingType === "duration" ? "sec" : "0"}
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
        );
      })}
    </div>
  );
}
