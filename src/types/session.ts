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
};