export type SetData = {
  weight: string;
  reps: string;
  rpe: string;
  // Unilateral (one-side-at-a-time) exercises only. Sets are still
  // stored flat, in left, right, left, right order - so pair N is
  // sets[2N] + sets[2N + 1] - which keeps every aggregator that just
  // sums or scans sets (tonnage, PRs, charts) working unchanged and
  // naturally counting both sides. Omitted for normal two-sided lifts.
  side?: "left" | "right";
};

export type ExerciseRecord = {
  name: string;
  sets: SetData[];
};

// A warm-up or cool-down attached to a lifting session - same three
// things a standalone cardio session records, just nested inside the
// workout instead of being its own History entry.
export type CardioBlock = {
  cardioType: string;
  minutes: number;
  // 1-10, same scale as a standalone session's cardioRpe.
  effort: number;
  notes?: string;
  // Set only by utils/migrations.ts: the id of the standalone cardio
  // session this block was folded in from. It's what makes the
  // migration safe to re-run (e.g. after restoring an old backup) -
  // a standalone entry whose id is already attached somewhere is
  // recognised as a duplicate and dropped rather than attached twice.
  migratedFromId?: string;
};

export type WorkoutSession = {
  id: string;
  date: string;
  notes: string;
  // Lifting sessions: minutes actually spent lifting (from leaving the
  // warm-up screen to tapping Finish on the last lift). Sessions saved
  // before that was measured hold the workout template's estimate.
  // Excludes warm-up/cool-down minutes, which live in their blocks.
  // Cardio sessions: the logged cardio minutes.
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
  // Lifting sessions only, both optional and skippable.
  warmUp?: CardioBlock;
  coolDown?: CardioBlock;
  // "lift" (default when omitted, covering every session saved
  // before cardio existed) or "cardio". Cardio sessions are now only
  // for cardio-only days - cardio done around a workout is attached
  // to it as warmUp/coolDown instead. They have no exercises/
  // workoutId/workoutName - just cardioType/cardioRpe below, and
  // reuse `duration` above for the actual logged minutes.
  type?: "lift" | "cardio";
  // "Walking" | "Cycling" | "Rowing" | "Intervals" - cardio only.
  cardioType?: string;
  // Effort, 1-10, cardio only.
  cardioRpe?: number;
};
