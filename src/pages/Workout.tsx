import { useState } from "react";
import ExerciseCard from "../components/ExerciseCard";
import { workoutA } from "../data/workoutA";
import { saveSession } from "../utils/sessionStorage";

type SetData = {
  weight: string;
  reps: string;
  rpe: string;
};

export default function Workout() {
  const [notes, setNotes] = useState("");

  const [exerciseData, setExerciseData] = useState<
    Record<string, SetData[]>
  >({});

  const handleExerciseChange = (
    exerciseName: string,
    sets: SetData[]
  ) => {
    setExerciseData((prev) => ({
      ...prev,
      [exerciseName]: sets,
    }));
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
      date: new Date().toLocaleDateString("en-GB"),
      notes,
      duration: 65,
      exercises,
    });

    console.log("Workout Saved");
    console.log(exercises);

    alert("Workout saved");
  };

  return (
    <div className="app">
      <h1>Workout A</h1>

      <p>
        Exercises completed:{" "}
        {Object.keys(exerciseData).length}
      </p>

      {workoutA.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          name={exercise.name}
          targetWeight={exercise.targetWeight}
          onChange={handleExerciseChange}
        />
      ))}

      <textarea
        placeholder="How did today's workout feel?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          marginTop: "20px",
          padding: "12px",
          borderRadius: "12px",
        }}
      />

      <button
        className="finish-btn"
        onClick={handleSaveWorkout}
      >
        Save Workout
      </button>
    </div>
  );
}