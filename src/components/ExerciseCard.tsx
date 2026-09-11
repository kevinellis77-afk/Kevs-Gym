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
};

export default function ExerciseCard({
  name,
  targetWeight,
  onChange,
}: Props) {
  const previousWorkout =
    getLastExerciseData(name);

  const cleanWeight = (
    value: string
  ) =>
    String(value || "").replace(
      /[^0-9.]/g,
      ""
    );

  const [sets, setSets] = useState<SetData[]>([
    {
      weight: "",
      reps: "",
      rpe: "",
    },
    {
      weight: "",
      reps: "",
      rpe: "",
    },
    {
      weight: "",
      reps: "",
      rpe: "",
    },
  ]);

  useEffect(() => {
    if (previousWorkout?.sets) {
      const loadedSets =
        previousWorkout.sets.map(
          (set: SetData) => ({
            weight: cleanWeight(
              set.weight
            ),
            reps: set.reps || "",
            rpe: set.rpe || "",
          })
        );

      setSets(loadedSets);

      onChange(
        name,
        loadedSets
      );
    }
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
  };

  const lastWeight =
    previousWorkout?.sets?.[0]?.weight
      ? cleanWeight(
          previousWorkout.sets[0]
            .weight
        )
      : "";

  const lastReps =
    previousWorkout?.sets?.[0]?.reps ||
    "";

  return (
    <div className="exercise-card">
      <h3>{name}</h3>

      <div
        style={{
          marginBottom: "12px",
        }}
      >
        <p
          style={{
            margin: "4px 0",
            color: "#facc15",
          }}
        >
          🎯 Target: {targetWeight}kg
        </p>

        {previousWorkout && (
          <p
            style={{
              margin: "4px 0",
              color: "#22c55e",
            }}
          >
            📈 Last: {lastWeight}kg ×{" "}
            {lastReps}
          </p>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "60px 90px 70px 70px",
          gap: "8px",
          marginBottom: "8px",
          fontSize: "12px",
          opacity: 0.7,
          fontWeight: 600,
        }}
      >
        <div></div>
        <div>Weight</div>
        <div>Reps</div>
        <div>RPE</div>
      </div>

      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            display: "grid",
            gridTemplateColumns:
              "60px 90px 70px 70px",
            gap: "8px",
            marginBottom: "8px",
            alignItems: "center",
          }}
        >
          <span>
            Set {index + 1}
          </span>

          <input
            type="number"
            step="0.5"
            value={sets[index].weight}
            placeholder="Weight"
            style={{
              width: "90px",
            }}
            onChange={(e) =>
              updateSet(
                index,
                "weight",
                cleanWeight(
                  e.target.value
                )
              )
            }
          />

          <input
            type="number"
            value={sets[index].reps}
            placeholder="Reps"
            style={{
              width: "70px",
            }}
            onChange={(e) =>
              updateSet(
                index,
                "reps",
                e.target.value
              )
            }
          />

          <input
            type="number"
            value={sets[index].rpe}
            placeholder="RPE"
            style={{
              width: "70px",
            }}
            onChange={(e) =>
              updateSet(
                index,
                "rpe",
                e.target.value
              )
            }
          />
        </div>
      ))}
    </div>
  );
}