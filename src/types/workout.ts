export interface Exercise {
    id: string;
    name: string;
    targetWeight: number;
    sets: number;
    targetReps: number;
  }
  
  export interface SetData {
    weight: number;
    reps: number;
    rpe: number;
  }
  
  export interface ExerciseLog {
    exerciseId: string;
    sets: SetData[];
  }
  
  export interface WorkoutSession {
    date: string;
    exercises: ExerciseLog[];
    cardioType: string;
    cardioMinutes: number;
    cardioRpe: number;
    notes: string;
  }
