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
};