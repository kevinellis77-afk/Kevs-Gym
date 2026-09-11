import { workoutA } from "./workoutA";

export type WorkoutExercise = {
  id: string;
  name: string;
  targetWeight: number;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  estimatedMinutes: number;
  exercises: WorkoutExercise[];
};

/**
 * All available workouts, in rotation order.
 * getNextWorkout() (utils/workoutRotation.ts) cycles through this
 * array based on whichever workout you completed most recently.
 *
 * To add another workout: give it a unique id, drop its exercise
 * list into a data/workoutB.ts (same shape as workoutA.ts), import
 * it here, and add an entry below.
 */
export const workouts: WorkoutTemplate[] = [
  {
    id: "workoutA",
    name: "Workout A",
    estimatedMinutes: 65,
    exercises: workoutA,
  },

  // {
  //   id: "workoutB",
  //   name: "Workout B",
  //   estimatedMinutes: 65,
  //   exercises: workoutB,
  // },
];