import { workoutA } from "./workoutA";
import { workoutB } from "./workoutB";
import { workoutC } from "./workoutC";

export type WorkoutExercise = {
  id: string;
  name: string;
  targetWeight: number;
  // Defaults to "reps" when omitted. "duration" is for timed holds
  // (e.g. Suitcase Hold) — the value still goes in the same "reps"
  // slot in SetData, this only changes how the UI labels it.
  trackingType?: "reps" | "duration";
  // How much weight to add when nextWorkoutTargets.ts decides you're
  // ready to progress. Defaults to 2.5kg when omitted - the smallest
  // step the gym's cable stacks actually move in, so it also covers
  // isolation/single-joint lifts that shouldn't jump further than
  // that in one go. Bigger compound lower-body lifts use 5kg.
  incrementKg?: number;
  // Done one side at a time (single-arm/single-leg, or a rotational
  // move worked each way). Logged as left/right pairs - one "set" is
  // left + right - see SetData.side in types/session.ts.
  unilateral?: boolean;
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
 * list into a data/workoutX.ts (same shape as workoutA.ts), import
 * it here, and add an entry below.
 */
export const workouts: WorkoutTemplate[] = [
  {
    id: "workoutA",
    name: "Workout A",
    estimatedMinutes: 65,
    exercises: workoutA,
  },
  {
    id: "workoutB",
    name: "Workout B",
    estimatedMinutes: 55,
    exercises: workoutB,
  },
  {
    id: "workoutC",
    name: "Workout C",
    estimatedMinutes: 65,
    exercises: workoutC,
  },
];