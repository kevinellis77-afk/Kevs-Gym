type SetRecord = {
  weight: string;
  reps: string;
  rpe: string;
};

type ExerciseRecord = {
  name: string;
  sets: SetRecord[];
};

export interface WorkoutSession {
  id: string;
  date: string;
  notes: string;
  duration: number;
  exercises: ExerciseRecord[];
}