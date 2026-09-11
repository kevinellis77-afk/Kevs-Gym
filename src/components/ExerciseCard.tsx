import { useState } from "react";

type SetData = {
  weight: string;
  reps: string;
  rpe: string;
};

type Props = {
  name: string;
  targetWeight: number;
  onChange: (exerciseName: string, sets: SetData[]) => void;
};

export default function ExerciseCard({
  name,
  targetWeight,
  onChange,
}: Props) {
  const [sets, setSets] = useState<SetData[]>([
    { weight: "", reps: "", rpe: "" },
    { weight: "", reps: "", rpe: "" },
    { weight: "", reps: "", rpe: "" },
  ]);

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

  return (
    <div className="exercise-card">
      <h3>{name}</h3>

      <p>Target Weight: {targetWeight}kg</p>

      {[0, 1, 2].map((index) => (
        <div key={index} className="set-row">
          <span>Set {index + 1}</span>

          <input
  placeholder="Weight"
  value={sets[index].weight}
  onChange={(e) =>
    updateSet(
      index,
      "weight",
      e.target.value.replace(
        /[^0-9.]/g,
        ""
      )
    )
  }
/>

          <input
            placeholder="Reps"
            value={sets[index].reps}
            onChange={(e) =>
              updateSet(index, "reps", e.target.value)
            }
          />

          <input
            placeholder="RPE"
            value={sets[index].rpe}
            onChange={(e) =>
              updateSet(index, "rpe", e.target.value)
            }
          />
        </div>
      ))}
    </div>
  );
}