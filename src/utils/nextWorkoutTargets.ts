import { getSessions } from "./sessionStorage";
import { getNextWorkout } from "./workoutRotation";
import { getPairs, isPairedRecord } from "./setFormat";
import type { WorkoutExercise } from "../data/workouts";
import type { SetData } from "../types/session";

export type WorkoutTarget = {
  name: string;
  lastWeight: number;
  targetWeight: number;
  // "progress": ready to add load - two consecutive manageable sessions.
  // "hold": stay at the same weight - either high effort last time, or
  //   only one manageable session logged so far at this weight.
  // "unknown": no RPE data to assess readiness, using a flat increment.
  status: "progress" | "hold" | "unknown";
};

function bestSingleSetOf(sets: SetData[]) {
  const validSets = sets.filter((set) => Number(set.weight) > 0);

  if (validSets.length === 0) return null;

  return validSets.reduce((best, current) =>
    Number(current.weight) > Number(best.weight) ? current : best
  );
}

/**
 * The best "set" from one session's record of an exercise, as
 * {weight, reps, rpe}.
 *
 * Unilateral records compare like-for-like: each complete left/right
 * pair counts as ONE set, worth the weaker side's weight and reps and
 * the harder side's RPE - so a pair is only "at 17.5kg" if both sides
 * did 17.5kg, and only "manageable" if neither side was a grind. The
 * best pair is then compared against the previous session's best
 * pair, exactly as a normal lift compares best set to best set.
 * A half pair (one side only) is ignored; if a record somehow has no
 * complete pairs at all, it falls back to treating sets individually.
 */
function bestSetOf(exerciseRecord: any) {
  const sets: SetData[] = exerciseRecord?.sets || [];

  if (isPairedRecord(sets)) {
    const pairSets = getPairs(sets)
      .filter((pair) => pair.left && pair.right)
      .map((pair) => {
        const left = pair.left as SetData;
        const right = pair.right as SetData;

        return {
          weight: String(Math.min(Number(left.weight), Number(right.weight))),
          reps: String(Math.min(Number(left.reps), Number(right.reps))),
          rpe: String(Math.max(Number(left.rpe) || 0, Number(right.rpe) || 0)),
        };
      });

    if (pairSets.length > 0) return bestSingleSetOf(pairSets);
  }

  return bestSingleSetOf(sets);
}

/**
 * The RPE-aware target for one exercise, from a given sessions list.
 * Shared by getNextWorkoutTargets() (the whole upcoming workout) and
 * getSmartTargetForExercise() (a single exercise - used for a
 * mid-session substitute, which isn't necessarily part of the
 * upcoming workout's own exercise list). Returns null when there's
 * no logged history for this exercise yet.
 */
function computeTarget(
  exercise: WorkoutExercise,
  sessions: any[]
): WorkoutTarget | null {
  // Walk back through sessions (newest first) collecting the best
  // set from each one that actually logged this exercise - up to
  // the 2 most recent, which may be several sessions back now that
  // workouts rotate.
  const recentBests: {
    weight: number;
    reps: number;
    rpe: number;
  }[] = [];

  for (const session of sessions) {
    const loggedExercise = session.exercises?.find(
      (e: any) => e.name === exercise.name
    );

    if (!loggedExercise) continue;

    const best = bestSetOf(loggedExercise);

    if (!best) continue;

    recentBests.push({
      weight: Number(best.weight),
      reps: Number(best.reps),
      rpe: Number(best.rpe),
    });

    if (recentBests.length === 2) break;
  }

  if (recentBests.length === 0) return null;

  const [latest, previous] = recentBests;

  const increase = exercise.incrementKg ?? 2.5;

  let targetWeight: number;
  let status: WorkoutTarget["status"];

  if (!latest.rpe || latest.rpe <= 0) {
    // No RPE logged - can't assess readiness, fall back to a
    // straightforward increment like before.
    targetWeight = latest.weight + increase;
    status = "unknown";
  } else if (latest.rpe >= 9) {
    // Near-failure effort last time - hold the weight rather than
    // adding more load on top of a grinding set.
    targetWeight = latest.weight;
    status = "hold";
  } else if (
    previous &&
    previous.weight === latest.weight &&
    previous.rpe > 0 &&
    previous.rpe <= 8
  ) {
    // Two consecutive sessions at this weight, both manageable -
    // ready to add load.
    targetWeight = latest.weight + increase;
    status = "progress";
  } else {
    // Manageable, but only the first session at this weight (or the
    // previous session was at a different weight) - hold one more
    // session to confirm before increasing.
    targetWeight = latest.weight;
    status = "hold";
  }

  return {
    name: exercise.name,
    lastWeight: latest.weight,
    targetWeight,
    status,
  };
}

export function getNextWorkoutTargets(): WorkoutTarget[] {
  const sessions = getSessions();
  const upcomingWorkout = getNextWorkout();

  const targets: WorkoutTarget[] = [];

  upcomingWorkout.exercises.forEach((exercise) => {
    const target = computeTarget(exercise, sessions);
    if (target) targets.push(target);
  });

  return targets;
}

/**
 * Same RPE-aware logic as getNextWorkoutTargets(), for one exercise
 * directly - so a mid-session substitute (see
 * utils/exerciseSubstitutions.ts) gets the same smart-progression
 * treatment as anything in the upcoming workout's own list, rather
 * than falling back to a flat static target just because it wasn't
 * originally scheduled for today.
 */
export function getSmartTargetForExercise(
  exercise: WorkoutExercise
): WorkoutTarget | null {
  return computeTarget(exercise, getSessions());
}