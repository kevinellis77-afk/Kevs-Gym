export type SetData = {
  weight: string;
  reps: string;
  rpe: string;
};

export type ExerciseRecord = {
  name: string;
  sets: SetData[];
};

export type WorkoutSession = {
  id: string;
  date: string;
  notes: string;
  duration: number;
  exercises?: ExerciseRecord[];
  // Which workout template this session came from. Optional so
  // sessions saved before rotation was added still type-check.
  workoutId?: string;
  workoutName?: string;
  // Structured, one-tap readiness check, separate from per-set RPE -
  // "Felt Good" | "Manageable" | "Struggled" | "Something Hurt".
  // Optional: older sessions won't have it, and tapping one isn't
  // required to finish a workout.
  feeling?: string;
  // "lift" (default when omitted, covering every session saved
  // before cardio existed) or "cardio". Cardio sessions have no
  // exercises/workoutId/workoutName - just cardioType/cardioRpe
  // below, and reuse `duration` above for the actual logged
  // minutes rather than a separate cardioMinutes field.
  type?: "lift" | "cardio";
  // "Walking" | "Cycling" | "Rowing" | "Intervals" - cardio only.
  cardioType?: string;
  // Effort, 1-10, cardio only - same tap-select idea as lifting
  // RPE, kept as its own field since it describes the whole
  // session rather than one set.
  cardioRpe?: number;
};