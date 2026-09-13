import { getSessions } from "./sessionStorage";
import { getNextWorkout } from "./workoutRotation";

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

function bestSetOf(exerciseRecord: any) {
  const validSets = (exerciseRecord?.sets || []).filter(
    (set: any) => Number(set.weight) > 0
  );

  if (validSets.length === 0) return null;

  return validSets.reduce((best: any, current: any) =>
    Number(current.weight) > Number(best.weight) ? current : best
  );
}

export function getNextWorkoutTargets(): WorkoutTarget[] {
  const sessions = getSessions();
  const upcomingWorkout = getNextWorkout();

  const targets: WorkoutTarget[] = [];

  const lowerBodyExercises = [
    "Leg Press",
    "Leg Extension",
    "Seated Leg Curl",
  ];

  upcomingWorkout.exercises.forEach((exercise) => {
    // Walk back through sessions (newest first) collecting the best
    // set from each one that actually logged this exercise - up to
    // the 2 most recent, which may be several sessions back now that
    // workouts rotate.
    const recentBests: {
      weight: number;
      reps: number;
      rpe: number;
    }[] = [];

    for (const session of sessions as any[]) {
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

    if (recentBests.length === 0) return;

    const [latest, previous] = recentBests;

    const increase = lowerBodyExercises.includes(exercise.name)
      ? 5
      : 2.5;

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

    targets.push({
      name: exercise.name,
      lastWeight: latest.weight,
      targetWeight,
      status,
    });
  });

  return targets;
}